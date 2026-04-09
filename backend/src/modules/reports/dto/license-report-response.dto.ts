class LicenseTypeSummaryDto {
  licenseType!: string;
  quantity!: number;
  percentage!: number;
}

class LicenseTrendPointDto {
  issueDate!: string;
  quantity!: number;
}

export class LicenseReportResponseDto {
  dateFrom!: string;
  dateTo!: string;
  totalIssuedLicenses!: number;
  totalRegistryEntries!: number;
  licenseTypes!: LicenseTypeSummaryDto[];
  issueTrend!: LicenseTrendPointDto[];
}
