import { Injectable } from '@nestjs/common';

import { AuthenticationFailedError } from '../../../common/errors/authentication-failed.error';
import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { AccessControlService } from '../../access-control/services/access-control.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CurrentAccountResponseDto, AuthSessionResponseDto } from '../dto/auth-session-response.dto';
import { CreateRegistrationInviteDto } from '../dto/create-registration-invite.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterByInviteDto } from '../dto/register-by-invite.dto';
import {
  CreatedRegistrationInviteResponseDto,
  RegistrationInvitePublicInfoDto,
  RegistrationInviteResponseDto,
} from '../dto/registration-invite-response.dto';
import { UpdateCurrentAccountDto } from '../dto/update-current-account.dto';
import { AuthenticatedAccountEntity } from '../entities/authenticated-account.entity';
import { AuthAccountsRepository } from '../repositories/auth-accounts.repository';
import { AuthRegistrationRepository } from '../repositories/auth-registration.repository';
import { AuthSessionsRepository } from '../repositories/auth-sessions.repository';
import { RegistrationInviteWithRelations, RegistrationInvitesRepository } from '../repositories/registration-invites.repository';
import { AuthAccountMapper } from './auth-account.mapper';
import { AuthTokensService } from './auth-tokens.service';
import { PasswordHashService } from './password-hash.service';

const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly authAccountsRepository: AuthAccountsRepository,
    private readonly authRegistrationRepository: AuthRegistrationRepository,
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly registrationInvitesRepository: RegistrationInvitesRepository,
    private readonly passwordHashService: PasswordHashService,
    private readonly authTokensService: AuthTokensService,
    private readonly accessControlService: AccessControlService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async registerByInvite(dto: RegisterByInviteDto): Promise<AuthSessionResponseDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedFullName = dto.fullName.trim().replace(/\s+/g, ' ');
    const inviteTokenHash = this.authTokensService.hashToken(dto.inviteToken);
    const invite = await this.registrationInvitesRepository.findByTokenHash(inviteTokenHash);

    this.ensureInviteIsUsable(invite);

    const authAccount = await this.authRegistrationRepository.registerByInvite({
      inviteId: invite.id,
      inviteTokenHash,
      inviteEmail: invite.email,
      email: normalizedEmail,
      fullName: normalizedFullName,
      passwordHash: this.passwordHashService.hash(dto.password),
    });

    return this.createSessionResponse(authAccount.id);
  }

  async getRegistrationInviteInfo(inviteToken: string): Promise<RegistrationInvitePublicInfoDto> {
    const invite = await this.registrationInvitesRepository.findByTokenHash(
      this.authTokensService.hashToken(inviteToken),
    );

    this.ensureInviteIsUsable(invite);

    return {
      email: invite.email,
      expiresAt: invite.expiresAt.toISOString(),
      department: {
        id: invite.department.id,
        code: invite.department.code,
        name: invite.department.name,
      },
      accessRole: {
        code: invite.accessRole.code,
        name: invite.accessRole.name,
      },
    };
  }

  async listRegistrationInvites(): Promise<RegistrationInviteResponseDto[]> {
    const invites = await this.registrationInvitesRepository.findManyRecent();
    return invites.map((invite) => this.mapRegistrationInvite(invite));
  }

  async createRegistrationInvite(
    createdByAccountId: string,
    dto: CreateRegistrationInviteDto,
  ): Promise<CreatedRegistrationInviteResponseDto> {
    const accessRole = await this.usersRepository.findAccessRoleByCode(dto.accessRoleCode);

    if (!accessRole) {
      throw new ApplicationNotFoundError('Access role', `code=${dto.accessRoleCode}`);
    }

    const department = await this.usersRepository.findDepartmentById(dto.departmentId);

    if (!department) {
      throw new ApplicationNotFoundError('Department', `id=${dto.departmentId}`);
    }

    const normalizedEmail = dto.email?.trim().toLowerCase() || undefined;

    if (normalizedEmail) {
      const existingAccount = await this.authAccountsRepository.findByEmail(normalizedEmail);

      if (existingAccount) {
        throw new AuthenticationFailedError('Account with this email already exists');
      }
    }

    const inviteToken = this.authTokensService.generateAccessToken();
    const invite = await this.registrationInvitesRepository.create({
      tokenHash: this.authTokensService.hashToken(inviteToken),
      email: normalizedEmail,
      departmentId: department.id,
      accessRoleId: accessRole.id,
      createdByAccountId,
      expiresAt: new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000),
    });

    return {
      ...this.mapRegistrationInvite(invite),
      inviteToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthSessionResponseDto> {
    const authAccount = await this.authAccountsRepository.findByEmail(dto.email.toLowerCase());

    if (!authAccount || !this.passwordHashService.verify(dto.password, authAccount.passwordHash)) {
      throw new AuthenticationFailedError('Invalid email or password');
    }

    if (authAccount.status !== 'active') {
      throw new AuthenticationFailedError('Account is not active');
    }

    await this.authAccountsRepository.updateLastLoginAt(authAccount.id, new Date());

    return this.createSessionResponse(authAccount.id);
  }

  async getCurrentAccountByToken(accessToken: string): Promise<AuthenticatedAccountEntity> {
    const session = await this.authSessionsRepository.findActiveByTokenHash(
      this.authTokensService.hashToken(accessToken),
    );

    if (!session) {
      throw new AuthenticationFailedError('Session is missing or expired');
    }

    return this.buildAuthenticatedAccountEntity(session.authAccount.id);
  }

  async getCurrentAccount(accountId: string): Promise<CurrentAccountResponseDto> {
    const account = await this.buildAuthenticatedAccountEntity(accountId);
    return AuthAccountMapper.toCurrentAccountResponse(account);
  }

  async logout(accessToken: string): Promise<void> {
    await this.authSessionsRepository.revokeByTokenHash(this.authTokensService.hashToken(accessToken));
  }

  async updateCurrentAccount(
    accountId: string,
    dto: UpdateCurrentAccountDto,
  ): Promise<CurrentAccountResponseDto> {
    const authAccount = await this.authAccountsRepository.findById(accountId);

    if (!authAccount) {
      throw new AuthenticationFailedError('Account was not found');
    }

    const normalizedFullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.replace(/\s+/g, ' ').trim();
    await this.usersRepository.updateFullName(authAccount.user.id, normalizedFullName);

    const account = await this.buildAuthenticatedAccountEntity(accountId);
    return AuthAccountMapper.toCurrentAccountResponse(account);
  }

  private async createSessionResponse(accountId: string): Promise<AuthSessionResponseDto> {
    const accessToken = this.authTokensService.generateAccessToken();
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    await this.authSessionsRepository.create({
      authAccountId: accountId,
      tokenHash: this.authTokensService.hashToken(accessToken),
      expiresAt,
    });

    const account = await this.buildAuthenticatedAccountEntity(accountId);

    return {
      accessToken,
      expiresAt: expiresAt.toISOString(),
      account: AuthAccountMapper.toCurrentAccountResponse(account),
    };
  }

  private async buildAuthenticatedAccountEntity(accountId: string): Promise<AuthenticatedAccountEntity> {
    const authAccount = await this.authAccountsRepository.findById(accountId);

    if (!authAccount) {
      throw new AuthenticationFailedError('Account was not found');
    }

    const effectiveAccess = await this.accessControlService.getEffectiveAccessForUser(authAccount.user.id);

    return {
      accountId: authAccount.id,
      email: authAccount.email,
      status: authAccount.status,
      user: {
        id: authAccount.user.id,
        email: authAccount.user.email,
        fullName: authAccount.user.fullName,
        department: {
          id: authAccount.user.department.id,
          code: authAccount.user.department.code,
          name: authAccount.user.department.name,
        },
        accessRole: {
          code: effectiveAccess.roleCode,
          name: effectiveAccess.roleName,
        },
        groups: authAccount.user.groupMemberships
          .map((membership) => ({
            id: membership.group.id,
            code: membership.group.code,
            name: membership.group.name,
            type: membership.group.type,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      },
      permissions: effectiveAccess.permissions,
    };
  }

  private ensureInviteIsUsable(
    invite: RegistrationInviteWithRelations | null,
  ): asserts invite is RegistrationInviteWithRelations {
    if (!invite) {
      throw new AuthenticationFailedError('Invite was not found');
    }

    if (invite.usedAt) {
      throw new AuthenticationFailedError('Invite has already been used');
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      throw new AuthenticationFailedError('Invite has expired');
    }
  }

  private mapRegistrationInvite(invite: RegistrationInviteWithRelations): RegistrationInviteResponseDto {
    return {
      id: invite.id,
      email: invite.email,
      expiresAt: invite.expiresAt.toISOString(),
      usedAt: invite.usedAt?.toISOString() ?? null,
      createdAt: invite.createdAt.toISOString(),
      department: {
        id: invite.department.id,
        code: invite.department.code,
        name: invite.department.name,
      },
      accessRole: {
        code: invite.accessRole.code,
        name: invite.accessRole.name,
      },
    };
  }
}
