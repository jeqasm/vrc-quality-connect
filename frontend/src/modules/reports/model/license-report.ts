export type LicenseTypeSummary = {
  licenseType: string;
  quantity: number;
  percentage: number;
};

export type LicenseTrendPoint = {
  issueDate: string;
  quantity: number;
};

export type LicenseReport = {
  dateFrom: string;
  dateTo: string;
  totalIssuedLicenses: number;
  totalRegistryEntries: number;
  licenseTypes: LicenseTypeSummary[];
  issueTrend: LicenseTrendPoint[];
};
