import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentAccount } from '../../auth/decorators/current-account.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedAccountEntity } from '../../auth/entities/authenticated-account.entity';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { accessPermissionCodes } from '../constants/access-permission-codes';
import { AccessPermissionResponseDto } from '../dto/access-permission-response.dto';
import { AccessControlCatalogService } from '../services/access-control-catalog.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@RequirePermissions(accessPermissionCodes.groupsManage)
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlCatalogService: AccessControlCatalogService) {}

  @Get('permissions')
  findPermissions(
    @CurrentAccount() _currentAccount: AuthenticatedAccountEntity,
  ): Promise<AccessPermissionResponseDto[]> {
    return this.accessControlCatalogService.findPermissions();
  }
}
