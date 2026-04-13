import { IsDateString } from 'class-validator';

export class QueryManagementWeeklyReportDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
