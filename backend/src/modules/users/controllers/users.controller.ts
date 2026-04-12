import { Controller, Delete, Get, HttpCode, Param, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { CurrentAccount } from '../../auth/decorators/current-account.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedAccountEntity } from '../../auth/entities/authenticated-account.entity';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../services/users.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions(accessPermissionCodes.usersManage)
  @Get()
  findAll(@CurrentAccount() _currentAccount: AuthenticatedAccountEntity): Promise<UserResponseDto[]> {
    return this.usersService.findMany();
  }

  @RequirePermissions(accessPermissionCodes.usersManage)
  @HttpCode(204)
  @Delete(':userId')
  async delete(
    @Param('userId') userId: string,
    @CurrentAccount() currentAccount: AuthenticatedAccountEntity,
  ): Promise<void> {
    await this.usersService.deleteById(userId, currentAccount.user.id);
  }
}
