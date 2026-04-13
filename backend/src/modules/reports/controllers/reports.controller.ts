import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { LicenseReportResponseDto } from '../dto/license-report-response.dto';
import { ManagementWeeklyReportResponseDto } from '../dto/management-weekly-report-response.dto';
import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QueryLicenseReportDto } from '../dto/query-license-report.dto';
import { QueryManagementWeeklyReportDto } from '../dto/query-management-weekly-report.dto';
import { QueryQaWeeklyReportDto } from '../dto/query-qa-weekly-report.dto';
import { QuerySupportWeeklyReportDto } from '../dto/query-support-weekly-report.dto';
import { SupportWeeklyReportResponseDto } from '../dto/support-weekly-report-response.dto';
import { SummaryResponseDto } from '../dto/summary-response.dto';
import { ReportsService } from '../services/reports.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('licenses')
  @RequirePermissions(accessPermissionCodes.reportsLicensesView)
  getLicenseReport(
    @Query() dto: QueryLicenseReportDto,
  ): Promise<LicenseReportResponseDto> {
    return this.reportsService.getLicenseReport(dto);
  }

  @Get('qa/weekly-summary')
  @RequirePermissions(accessPermissionCodes.reportsQaView)
  getQaWeeklyReport(
    @Query() dto: QueryQaWeeklyReportDto,
  ): Promise<QaWeeklyReportResponseDto> {
    return this.reportsService.getQaWeeklyReport(dto);
  }

  @Get('support/weekly-summary')
  @RequirePermissions(accessPermissionCodes.reportsSupportView)
  getSupportWeeklyReport(
    @Query() dto: QuerySupportWeeklyReportDto,
  ): Promise<SupportWeeklyReportResponseDto> {
    return this.reportsService.getSupportWeeklyReport(dto);
  }

  @Get('management/weekly-summary')
  @RequirePermissions(accessPermissionCodes.reportsManagementView)
  getManagementWeeklyReport(
    @Query() dto: QueryManagementWeeklyReportDto,
  ): Promise<ManagementWeeklyReportResponseDto> {
    return this.reportsService.getManagementWeeklyReport(dto);
  }

  @Get('summary')
  @RequirePermissions(accessPermissionCodes.dashboardView)
  getSummary(): Promise<SummaryResponseDto> {
    return this.reportsService.getSummary();
  }
}
