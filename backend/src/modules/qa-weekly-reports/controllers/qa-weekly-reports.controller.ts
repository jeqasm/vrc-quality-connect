import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QueryQaWeeklyReportsDto } from '../dto/query-qa-weekly-reports.dto';
import { UpsertQaWeeklyReportDto } from '../dto/upsert-qa-weekly-report.dto';
import { QaWeeklyReportsService } from '../services/qa-weekly-reports.service';

@Controller('qa-weekly-reports')
export class QaWeeklyReportsController {
  constructor(private readonly qaWeeklyReportsService: QaWeeklyReportsService) {}

  @Get()
  findOne(@Query() dto: QueryQaWeeklyReportsDto): Promise<QaWeeklyReportResponseDto | null> {
    return this.qaWeeklyReportsService.findOne(dto);
  }

  @Put()
  upsert(@Body() dto: UpsertQaWeeklyReportDto): Promise<QaWeeklyReportResponseDto> {
    return this.qaWeeklyReportsService.upsert(dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string): Promise<QaWeeklyReportResponseDto> {
    return this.qaWeeklyReportsService.submit(id);
  }
}
