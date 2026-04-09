import { apiClient } from '../../../shared/api/api-client';
import {
  ActivityRecord,
  ActivityRecordFilters,
  CreateActivityRecordPayload,
} from '../model/activity-record';

function buildQueryString(filters: ActivityRecordFilters): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function getActivityRecords(filters: ActivityRecordFilters): Promise<ActivityRecord[]> {
  return apiClient<ActivityRecord[]>(`/activity-records${buildQueryString(filters)}`);
}

export function createActivityRecord(
  payload: CreateActivityRecordPayload,
): Promise<ActivityRecord> {
  return apiClient<ActivityRecord>('/activity-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
