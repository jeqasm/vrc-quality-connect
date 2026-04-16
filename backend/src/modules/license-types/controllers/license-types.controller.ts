import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CreateLicenseTypeDto } from '../dto/create-license-type.dto';
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

  @Post()
  @RequirePermissions(accessPermissionCodes.licensesView)
  create(@Body() dto: CreateLicenseTypeDto): Promise<LicenseTypeResponseDto> {
    return this.licenseTypesService.create(dto);
  }

  @Delete(':id')
  @RequirePermissions(accessPermissionCodes.licensesView)
  delete(@Param('id') id: string): Promise<void> {
    return this.licenseTypesService.delete(id);
  }
}
