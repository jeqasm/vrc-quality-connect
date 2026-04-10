import { IsDateString } from 'class-validator';

export class QueryQaWeeklyReportDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
