import { apiClient } from '../../../shared/api/api-client';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { ManagementWeeklyReportSummary } from '../model/management-weekly-report';

export function getManagementWeeklyReportSummary(
  dateRange: DateRangeValue,
): Promise<ManagementWeeklyReportSummary> {
  const searchParams = new URLSearchParams({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  return apiClient<ManagementWeeklyReportSummary>(
    `/reports/management/weekly-summary?${searchParams.toString()}`,
  );
}
