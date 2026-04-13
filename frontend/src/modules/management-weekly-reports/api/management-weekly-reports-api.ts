import { apiClient } from '../../../shared/api/api-client';
import {
  ManagementWeeklyReport,
  SaveManagementWeeklyReportPayload,
} from '../model/management-weekly-report';

type GetManagementWeeklyReportParams = {
  userId: string;
  weekStart: string;
};

export function getManagementWeeklyReport(
  params: GetManagementWeeklyReportParams,
): Promise<ManagementWeeklyReport | null> {
  const searchParams = new URLSearchParams({
    userId: params.userId,
    weekStart: params.weekStart,
  });

  return apiClient<ManagementWeeklyReport | null>(
    `/management-weekly-reports?${searchParams.toString()}`,
  );
}

export function saveManagementWeeklyReport(
  payload: SaveManagementWeeklyReportPayload,
): Promise<ManagementWeeklyReport> {
  return apiClient<ManagementWeeklyReport>('/management-weekly-reports', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function submitManagementWeeklyReport(id: string): Promise<ManagementWeeklyReport> {
  return apiClient<ManagementWeeklyReport>(`/management-weekly-reports/${id}/submit`, {
    method: 'POST',
  });
}
