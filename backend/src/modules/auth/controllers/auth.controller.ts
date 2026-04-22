import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

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
import { UpdateCurrentAccountPasswordDto } from '../dto/update-current-account-password.dto';
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
  login(@Req() request: Request, @Body() dto: LoginDto): Promise<AuthSessionResponseDto> {
    return this.authService.login(dto, this.extractClientIp(request));
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

  @UseGuards(AuthSessionGuard, PermissionsGuard)
  @RequirePermissions(accessPermissionCodes.usersManage)
  @HttpCode(204)
  @Delete('registration-invites/:inviteId')
  deleteRegistrationInvite(@Param('inviteId') inviteId: string): Promise<void> {
    return this.authService.deleteRegistrationInvite(inviteId);
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
  @Patch('me/password')
  updateMePassword(
    @CurrentAccount() account: AuthenticatedAccountEntity,
    @Body() dto: UpdateCurrentAccountPasswordDto,
  ): Promise<void> {
    return this.authService.updateCurrentAccountPassword(account.accountId, dto);
  }

  @UseGuards(AuthSessionGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    const authorizationHeader = request.headers.authorization!;
    const accessToken = authorizationHeader.slice('Bearer '.length).trim();
    await this.authService.logout(accessToken);
  }

  private extractClientIp(request: Request): string {
    const forwardedForHeader = request.headers['x-forwarded-for'];

    if (typeof forwardedForHeader === 'string' && forwardedForHeader.length > 0) {
      return forwardedForHeader.split(',')[0].trim();
    }

    if (Array.isArray(forwardedForHeader) && forwardedForHeader.length > 0) {
      return forwardedForHeader[0].trim();
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
