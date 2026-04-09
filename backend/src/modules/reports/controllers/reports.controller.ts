import { Controller, Get, Query } from '@nestjs/common';

import { LicenseReportResponseDto } from '../dto/license-report-response.dto';
import { QueryLicenseReportDto } from '../dto/query-license-report.dto';
import { SummaryResponseDto } from '../dto/summary-response.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('licenses')
  getLicenseReport(
    @Query() dto: QueryLicenseReportDto,
  ): Promise<LicenseReportResponseDto> {
    return this.reportsService.getLicenseReport(dto);
  }

  @Get('summary')
  getSummary(): Promise<SummaryResponseDto> {
    return this.reportsService.getSummary();
  }
}
