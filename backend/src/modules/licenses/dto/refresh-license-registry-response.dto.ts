import { LicenseRegistryRowResponseDto } from './license-registry-row-response.dto';
import { LicenseRegistryWarningResponseDto } from './license-registry-warning-response.dto';

export class RefreshLicenseRegistryResponseDto {
  importedAt!: string;
  sourceSheetName!: string;
  sourceDocumentUrl!: string;
  dateFrom!: string;
  dateTo!: string;
  totalSourceRows!: number;
  matchedSourceRows!: number;
  aggregatedRows!: number;
  skippedRows!: number;
  rows!: LicenseRegistryRowResponseDto[];
  warnings!: LicenseRegistryWarningResponseDto[];
}
