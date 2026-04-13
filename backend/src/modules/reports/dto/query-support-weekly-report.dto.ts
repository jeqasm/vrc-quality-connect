import { IsDateString } from 'class-validator';

export class QuerySupportWeeklyReportDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
