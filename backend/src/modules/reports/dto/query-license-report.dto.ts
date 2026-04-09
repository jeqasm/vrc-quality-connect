import { IsDateString } from 'class-validator';

export class QueryLicenseReportDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
