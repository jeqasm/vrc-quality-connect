import { IsDateString } from 'class-validator';

export class QueryLicenseRegistryDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
