import { apiClient } from '../../../shared/api/api-client';
import { ReportSummary } from '../model/report-summary';

export function getReportSummary(): Promise<ReportSummary> {
  return apiClient<ReportSummary>('/reports/summary');
}
