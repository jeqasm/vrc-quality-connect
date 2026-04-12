import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { LicenseTypeResponseDto } from '../dto/license-type-response.dto';
import { LicenseTypesService } from '../services/license-types.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('license-types')
export class LicenseTypesController {
  constructor(private readonly licenseTypesService: LicenseTypesService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.licensesView)
  findMany(): Promise<LicenseTypeResponseDto[]> {
    return this.licenseTypesService.findMany();
  }
}
