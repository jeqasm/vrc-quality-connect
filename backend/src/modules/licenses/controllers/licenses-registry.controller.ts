import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { QueryLicenseRegistryDto } from '../dto/query-license-registry.dto';
import { RefreshLicenseRegistryDto } from '../dto/refresh-license-registry.dto';
import { RefreshLicenseRegistryResponseDto } from '../dto/refresh-license-registry-response.dto';
import { RefreshLicenseRegistryService } from '../services/refresh-license-registry.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('licenses/registry')
export class LicensesRegistryController {
  constructor(private readonly refreshLicenseRegistryService: RefreshLicenseRegistryService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.licensesView)
  getSnapshot(
    @Query() dto: QueryLicenseRegistryDto,
  ): Promise<RefreshLicenseRegistryResponseDto> {
    return this.refreshLicenseRegistryService.getSnapshot(dto);
  }

  @Post('refresh')
  @RequirePermissions(accessPermissionCodes.licensesView)
  refresh(
    @Body() dto: RefreshLicenseRegistryDto,
  ): Promise<RefreshLicenseRegistryResponseDto> {
    return this.refreshLicenseRegistryService.execute(dto);
  }
}
