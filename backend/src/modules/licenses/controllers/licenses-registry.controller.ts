import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { CurrentAccount } from '../../auth/decorators/current-account.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedAccountEntity } from '../../auth/entities/authenticated-account.entity';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CreateLicenseRegistryRecordDto } from '../dto/create-license-registry-record.dto';
import { LicenseRegistryRecordResponseDto } from '../dto/license-registry-record-response.dto';
import { LicenseRegistrySnapshotResponseDto } from '../dto/license-registry-snapshot-response.dto';
import { QueryLicenseRegistryDto } from '../dto/query-license-registry.dto';
import { RefreshLicenseRegistryDto } from '../dto/refresh-license-registry.dto';
import { RefreshLicenseRegistryResponseDto } from '../dto/refresh-license-registry-response.dto';
import { UpdateLicenseRegistryRecordDto } from '../dto/update-license-registry-record.dto';
import { LicenseRegistryRecordsService } from '../services/license-registry-records.service';
import { RefreshLicenseRegistryService } from '../services/refresh-license-registry.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('licenses/registry')
export class LicensesRegistryController {
  constructor(
    private readonly refreshLicenseRegistryService: RefreshLicenseRegistryService,
    private readonly licenseRegistryRecordsService: LicenseRegistryRecordsService,
  ) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.licensesView)
  getSnapshot(
    @Query() dto: QueryLicenseRegistryDto,
  ): Promise<LicenseRegistrySnapshotResponseDto> {
    return this.licenseRegistryRecordsService.getSnapshot(dto);
  }

  @Post()
  @RequirePermissions(accessPermissionCodes.licensesView)
  create(
    @Body() dto: CreateLicenseRegistryRecordDto,
    @CurrentAccount() currentAccount: AuthenticatedAccountEntity,
  ): Promise<LicenseRegistryRecordResponseDto> {
    return this.licenseRegistryRecordsService.create(dto, currentAccount.user.id);
  }

  @Patch(':recordId')
  @RequirePermissions(accessPermissionCodes.licensesView)
  update(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateLicenseRegistryRecordDto,
  ): Promise<LicenseRegistryRecordResponseDto> {
    return this.licenseRegistryRecordsService.update(recordId, dto);
  }

  @HttpCode(204)
  @Delete(':recordId')
  @RequirePermissions(accessPermissionCodes.licensesView)
  async delete(@Param('recordId') recordId: string): Promise<void> {
    await this.licenseRegistryRecordsService.delete(recordId);
  }

  @Post('refresh')
  @RequirePermissions(accessPermissionCodes.licensesView)
  refresh(
    @Body() dto: RefreshLicenseRegistryDto,
  ): Promise<RefreshLicenseRegistryResponseDto> {
    return this.refreshLicenseRegistryService.execute(dto);
  }
}
