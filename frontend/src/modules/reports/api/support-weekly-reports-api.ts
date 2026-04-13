import { apiClient } from '../../../shared/api/api-client';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { SupportWeeklyReportSummary } from '../model/support-weekly-report';

export function getSupportWeeklyReportSummary(
  dateRange: DateRangeValue,
): Promise<SupportWeeklyReportSummary> {
  const searchParams = new URLSearchParams({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  return apiClient<SupportWeeklyReportSummary>(
    `/reports/support/weekly-summary?${searchParams.toString()}`,
  );
}
