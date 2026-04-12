import { apiClient } from '../../../shared/api/api-client';
import { LicenseRegistryRecord, LicenseRegistrySnapshot, LicensesMeta } from '../model/license-registry';

type LicenseRegistryPeriodPayload = {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
};

export function getLicenseRegistrySnapshot(
  payload: LicenseRegistryPeriodPayload,
): Promise<LicenseRegistrySnapshot> {
  const searchParams = new URLSearchParams();

  if (payload.dateFrom) {
    searchParams.set('dateFrom', payload.dateFrom);
  }

  if (payload.dateTo) {
    searchParams.set('dateTo', payload.dateTo);
  }

  if (payload.limit !== undefined) {
    searchParams.set('limit', `${payload.limit}`);
  }

  if (payload.offset !== undefined) {
    searchParams.set('offset', `${payload.offset}`);
  }

  return apiClient<LicenseRegistrySnapshot>(`/licenses/registry?${searchParams.toString()}`);
}

export type LicenseRegistryRecordPayload = {
  issueDate: string;
  licenseTypeId: string;
  quantity: number;
  organizationName?: string;
  recipientEmail?: string;
  issuedTo: string;
  comment?: string;
};

export function createLicenseRegistryRecord(
  payload: LicenseRegistryRecordPayload,
): Promise<LicenseRegistryRecord> {
  return apiClient<LicenseRegistryRecord>('/licenses/registry', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateLicenseRegistryRecord(
  recordId: string,
  payload: LicenseRegistryRecordPayload,
): Promise<LicenseRegistryRecord> {
  return apiClient<LicenseRegistryRecord>(`/licenses/registry/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteLicenseRegistryRecord(recordId: string): Promise<void> {
  return apiClient<void>(`/licenses/registry/${recordId}`, {
    method: 'DELETE',
  });
}

export function getLicensesMeta(): Promise<LicensesMeta> {
  return apiClient<LicensesMeta>('/licenses/meta');
}
