import { apiClient } from '../../../shared/api/api-client';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { LicenseReport } from '../model/license-report';

export function getLicenseReport(dateRange: DateRangeValue): Promise<LicenseReport> {
  const searchParams = new URLSearchParams(dateRange);
  return apiClient<LicenseReport>(`/reports/licenses?${searchParams.toString()}`);
}
