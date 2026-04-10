import { apiClient } from '../../../shared/api/api-client';
import { QaWeeklyReport, SaveQaWeeklyReportPayload } from '../model/qa-weekly-report';

type GetQaWeeklyReportParams = {
  userId: string;
  weekStart: string;
};

export function getQaWeeklyReport(
  params: GetQaWeeklyReportParams,
): Promise<QaWeeklyReport | null> {
  const searchParams = new URLSearchParams({
    userId: params.userId,
    weekStart: params.weekStart,
  });

  return apiClient<QaWeeklyReport | null>(`/qa-weekly-reports?${searchParams.toString()}`);
}

export function saveQaWeeklyReport(
  payload: SaveQaWeeklyReportPayload,
): Promise<QaWeeklyReport> {
  return apiClient<QaWeeklyReport>('/qa-weekly-reports', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function submitQaWeeklyReport(id: string): Promise<QaWeeklyReport> {
  return apiClient<QaWeeklyReport>(`/qa-weekly-reports/${id}/submit`, {
    method: 'POST',
  });
}
