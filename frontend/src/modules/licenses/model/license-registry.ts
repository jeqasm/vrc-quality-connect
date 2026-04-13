export type LicenseTypeOption = {
  id: string;
  code: string;
  name: string;
};

export type LicenseRegistrySortBy =
  | 'issueDate'
  | 'licenseType'
  | 'quantity'
  | 'issuedTo'
  | 'organizationName'
  | 'recipientEmail';

export type SortDirection = 'asc' | 'desc';

export type LicenseRegistryRecord = {
  id: string;
  issueDate: string;
  quantity: number;
  organizationName: string | null;
  recipientEmail: string | null;
  issuedTo: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  licenseType: LicenseTypeOption;
};

export type LicenseRegistrySnapshot = {
  dateFrom: string;
  dateTo: string;
  search: string;
  licenseTypeId: string;
  sortBy: LicenseRegistrySortBy;
  sortDirection: SortDirection;
  limit: number;
  offset: number;
  totalIssuedLicenses: number;
  totalRecords: number;
  uniqueRecipients: number;
  uniqueOrganizations: number;
  rows: LicenseRegistryRecord[];
};

export type LicensesMeta = {
  module: string;
  implementationStatus: string;
  licenseTypes: LicenseTypeOption[];
};
