import { apiClient } from '../../../shared/api/api-client';
import {
  SaveSupportWeeklyReportPayload,
  SupportWeeklyReport,
} from '../model/support-weekly-report';

type GetSupportWeeklyReportParams = {
  userId: string;
  weekStart: string;
};

export function getSupportWeeklyReport(
  params: GetSupportWeeklyReportParams,
): Promise<SupportWeeklyReport | null> {
  const searchParams = new URLSearchParams({
    userId: params.userId,
    weekStart: params.weekStart,
  });

  return apiClient<SupportWeeklyReport | null>(
    `/support-weekly-reports?${searchParams.toString()}`,
  );
}

export function saveSupportWeeklyReport(
  payload: SaveSupportWeeklyReportPayload,
): Promise<SupportWeeklyReport> {
  return apiClient<SupportWeeklyReport>('/support-weekly-reports', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function submitSupportWeeklyReport(id: string): Promise<SupportWeeklyReport> {
  return apiClient<SupportWeeklyReport>(`/support-weekly-reports/${id}/submit`, {
    method: 'POST',
  });
}
