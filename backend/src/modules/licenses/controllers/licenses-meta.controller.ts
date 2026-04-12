import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { LicenseMetaResponseDto } from '../dto/license-meta-response.dto';
import { LicensesService } from '../services/licenses.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('licenses')
export class LicensesMetaController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('meta')
  @RequirePermissions(accessPermissionCodes.licensesView)
  getMeta(): Promise<LicenseMetaResponseDto> {
    return this.licensesService.getMeta();
  }
}
