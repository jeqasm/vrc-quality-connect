import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedRequest } from '../../../common/auth/authenticated-request';
import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { CurrentAccount } from '../decorators/current-account.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { AuthSessionResponseDto, CurrentAccountResponseDto } from '../dto/auth-session-response.dto';
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
import { AuthSessionGuard } from '../guards/auth-session.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-by-invite')
  registerByInvite(@Body() dto: RegisterByInviteDto): Promise<AuthSessionResponseDto> {
    return this.authService.registerByInvite(dto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthSessionResponseDto> {
    return this.authService.login(dto);
  }

  @Get('registration-invites/:inviteToken')
  getInvite(@Param('inviteToken') inviteToken: string): Promise<RegistrationInvitePublicInfoDto> {
    return this.authService.getRegistrationInviteInfo(inviteToken);
  }

  @UseGuards(AuthSessionGuard, PermissionsGuard)
  @RequirePermissions(accessPermissionCodes.usersManage)
  @Get('registration-invites')
  listRegistrationInvites(): Promise<RegistrationInviteResponseDto[]> {
    return this.authService.listRegistrationInvites();
  }

  @UseGuards(AuthSessionGuard, PermissionsGuard)
  @RequirePermissions(accessPermissionCodes.usersManage)
  @Post('registration-invites')
  createRegistrationInvite(
    @CurrentAccount() account: AuthenticatedAccountEntity,
    @Body() dto: CreateRegistrationInviteDto,
  ): Promise<CreatedRegistrationInviteResponseDto> {
    return this.authService.createRegistrationInvite(account.accountId, dto);
  }

  @UseGuards(AuthSessionGuard)
  @Get('me')
  me(@CurrentAccount() account: AuthenticatedAccountEntity): Promise<CurrentAccountResponseDto> {
    return this.authService.getCurrentAccount(account.accountId);
  }

  @UseGuards(AuthSessionGuard)
  @Patch('me')
  updateMe(
    @CurrentAccount() account: AuthenticatedAccountEntity,
    @Body() dto: UpdateCurrentAccountDto,
  ): Promise<CurrentAccountResponseDto> {
    return this.authService.updateCurrentAccount(account.accountId, dto);
  }

  @UseGuards(AuthSessionGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    const authorizationHeader = request.headers.authorization!;
    const accessToken = authorizationHeader.slice('Bearer '.length).trim();
    await this.authService.logout(accessToken);
  }
}
