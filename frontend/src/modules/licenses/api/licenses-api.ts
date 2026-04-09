import { apiClient } from '../../../shared/api/api-client';
import { RefreshLicenseRegistryResponse } from '../model/license-registry';

type RefreshLicenseRegistryPayload = {
  dateFrom: string;
  dateTo: string;
};

export function getLicenseRegistrySnapshot(
  payload: RefreshLicenseRegistryPayload,
): Promise<RefreshLicenseRegistryResponse> {
  const searchParams = new URLSearchParams(payload);
  return apiClient<RefreshLicenseRegistryResponse>(`/licenses/registry?${searchParams.toString()}`);
}

export function refreshLicenseRegistry(
  payload: RefreshLicenseRegistryPayload,
): Promise<RefreshLicenseRegistryResponse> {
  return apiClient<RefreshLicenseRegistryResponse>('/licenses/registry/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
