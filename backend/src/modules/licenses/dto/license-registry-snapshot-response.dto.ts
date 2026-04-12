import { LicenseRegistryRecordResponseDto } from './license-registry-record-response.dto';

export class LicenseRegistrySnapshotResponseDto {
  dateFrom!: string;
  dateTo!: string;
  limit!: number;
  offset!: number;
  totalIssuedLicenses!: number;
  totalRecords!: number;
  uniqueRecipients!: number;
  uniqueOrganizations!: number;
  rows!: LicenseRegistryRecordResponseDto[];
}
