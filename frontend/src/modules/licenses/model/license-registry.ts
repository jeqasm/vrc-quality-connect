export type LicenseRegistryRow = {
  licenseType: string;
  quantity: number;
  issuedTo: string;
};

export type LicenseRegistryWarning = {
  sourceRowNumber: number;
  message: string;
};

export type RefreshLicenseRegistryResponse = {
  importedAt: string;
  sourceSheetName: string;
  sourceDocumentUrl: string;
  dateFrom: string;
  dateTo: string;
  totalSourceRows: number;
  matchedSourceRows: number;
  aggregatedRows: number;
  skippedRows: number;
  rows: LicenseRegistryRow[];
  warnings: LicenseRegistryWarning[];
};
