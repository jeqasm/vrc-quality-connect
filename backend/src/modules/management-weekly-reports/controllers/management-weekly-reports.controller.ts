import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ManagementWeeklyReportResponseDto } from '../dto/management-weekly-report-response.dto';
import { QueryManagementWeeklyReportsDto } from '../dto/query-management-weekly-reports.dto';
import { UpsertManagementWeeklyReportDto } from '../dto/upsert-management-weekly-report.dto';
import { ManagementWeeklyReportsService } from '../services/management-weekly-reports.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('management-weekly-reports')
export class ManagementWeeklyReportsController {
  constructor(private readonly managementWeeklyReportsService: ManagementWeeklyReportsService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.reportsManagementView)
  findOne(@Query() dto: QueryManagementWeeklyReportsDto): Promise<ManagementWeeklyReportResponseDto | null> {
    return this.managementWeeklyReportsService.findOne(dto);
  }

  @Put()
  @RequirePermissions(accessPermissionCodes.reportsManagementView)
  upsert(@Body() dto: UpsertManagementWeeklyReportDto): Promise<ManagementWeeklyReportResponseDto> {
    return this.managementWeeklyReportsService.upsert(dto);
  }

  @Post(':id/submit')
  @RequirePermissions(accessPermissionCodes.reportsManagementView)
  submit(@Param('id') id: string): Promise<ManagementWeeklyReportResponseDto> {
    return this.managementWeeklyReportsService.submit(id);
  }
}
