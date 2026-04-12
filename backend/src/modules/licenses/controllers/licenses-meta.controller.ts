import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('licenses')
export class LicensesMetaController {
  @Get('meta')
  @RequirePermissions(accessPermissionCodes.licensesView)
  getMeta() {
    return {
      module: 'licenses',
      implementationStatus: 'skeleton',
    };
  }
}
