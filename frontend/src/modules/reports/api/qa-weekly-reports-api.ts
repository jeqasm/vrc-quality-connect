import { apiClient } from '../../../shared/api/api-client';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { QaWeeklyReportSummary } from '../model/qa-weekly-report';

export function getQaWeeklyReportSummary(
  dateRange: DateRangeValue,
): Promise<QaWeeklyReportSummary> {
  const searchParams = new URLSearchParams({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  return apiClient<QaWeeklyReportSummary>(`/reports/qa/weekly-summary?${searchParams.toString()}`);
}
