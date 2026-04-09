import { Controller, Get } from '@nestjs/common';

import { SummaryResponseDto } from '../dto/summary-response.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(): Promise<SummaryResponseDto> {
    return this.reportsService.getSummary();
  }
}
