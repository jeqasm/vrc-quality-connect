import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const licenseRegistrySortByValues = [
  'issueDate',
  'licenseType',
  'quantity',
  'issuedTo',
  'organizationName',
  'recipientEmail',
] as const;

export const sortDirectionValues = ['asc', 'desc'] as const;

export type LicenseRegistrySortBy = (typeof licenseRegistrySortByValues)[number];
export type SortDirection = (typeof sortDirectionValues)[number];

export class QueryLicenseRegistryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  licenseTypeId?: string;

  @IsOptional()
  @IsIn(licenseRegistrySortByValues)
  sortBy?: LicenseRegistrySortBy;

  @IsOptional()
  @IsIn(sortDirectionValues)
  sortDirection?: SortDirection;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
