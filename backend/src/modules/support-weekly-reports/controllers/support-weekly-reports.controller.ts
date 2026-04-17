import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { QuerySupportWeeklyReportsDto } from '../dto/query-support-weekly-reports.dto';
import { SupportWeeklyReportResponseDto } from '../dto/support-weekly-report-response.dto';
import { UpsertSupportWeeklyReportDto } from '../dto/upsert-support-weekly-report.dto';
import { SupportWeeklyReportsService } from '../services/support-weekly-reports.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('support-weekly-reports')
export class SupportWeeklyReportsController {
  constructor(private readonly supportWeeklyReportsService: SupportWeeklyReportsService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.activityRecordsSupportView)
  findOne(@Query() dto: QuerySupportWeeklyReportsDto): Promise<SupportWeeklyReportResponseDto | null> {
    return this.supportWeeklyReportsService.findOne(dto);
  }

  @Put()
  @RequirePermissions(accessPermissionCodes.activityRecordsSupportView)
  upsert(@Body() dto: UpsertSupportWeeklyReportDto): Promise<SupportWeeklyReportResponseDto> {
    return this.supportWeeklyReportsService.upsert(dto);
  }

  @Post(':id/submit')
  @RequirePermissions(accessPermissionCodes.activityRecordsSupportView)
  submit(@Param('id') id: string): Promise<SupportWeeklyReportResponseDto> {
    return this.supportWeeklyReportsService.submit(id);
  }
}
