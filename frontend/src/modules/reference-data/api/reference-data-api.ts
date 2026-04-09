import { apiClient } from '../../../shared/api/api-client';
import {
  ReferenceDataBundle,
  ReferenceOption,
  UserOption,
} from '../model/reference-data';

export function getUsers(): Promise<UserOption[]> {
  return apiClient<UserOption[]>('/users');
}

export function getDepartments(): Promise<ReferenceOption[]> {
  return apiClient<ReferenceOption[]>('/departments');
}

export function getActivityTypes(): Promise<ReferenceOption[]> {
  return apiClient<ReferenceOption[]>('/activity-types');
}

export function getActivityResults(): Promise<ReferenceOption[]> {
  return apiClient<ReferenceOption[]>('/activity-results');
}

export async function getReferenceDataBundle(): Promise<ReferenceDataBundle> {
  const [users, departments, activityTypes, activityResults] = await Promise.all([
    getUsers(),
    getDepartments(),
    getActivityTypes(),
    getActivityResults(),
  ]);

  return {
    users,
    departments,
    activityTypes,
    activityResults,
  };
}
