import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QueryQaWeeklyReportsDto } from '../dto/query-qa-weekly-reports.dto';
import { UpsertQaWeeklyReportDto } from '../dto/upsert-qa-weekly-report.dto';
import { QaWeeklyReportsService } from '../services/qa-weekly-reports.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('qa-weekly-reports')
export class QaWeeklyReportsController {
  constructor(private readonly qaWeeklyReportsService: QaWeeklyReportsService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.activityRecordsQaView)
  findOne(@Query() dto: QueryQaWeeklyReportsDto): Promise<QaWeeklyReportResponseDto | null> {
    return this.qaWeeklyReportsService.findOne(dto);
  }

  @Put()
  @RequirePermissions(accessPermissionCodes.activityRecordsQaView)
  upsert(@Body() dto: UpsertQaWeeklyReportDto): Promise<QaWeeklyReportResponseDto> {
    return this.qaWeeklyReportsService.upsert(dto);
  }

  @Post(':id/submit')
  @RequirePermissions(accessPermissionCodes.activityRecordsQaView)
  submit(@Param('id') id: string): Promise<QaWeeklyReportResponseDto> {
    return this.qaWeeklyReportsService.submit(id);
  }
}
