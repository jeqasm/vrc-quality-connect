import { IsDateString } from 'class-validator';

export class RefreshLicenseRegistryDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}
