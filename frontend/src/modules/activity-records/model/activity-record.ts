export type ActivityRecordDictionary = {
  id: string;
  code: string;
  name: string;
};

export type ActivityRecordUser = {
  id: string;
  fullName: string;
  email: string;
};

export type ActivityRecord = {
  id: string;
  userId: string;
  departmentId: string;
  activityTypeId: string;
  activityResultId: string;
  workDate: string;
  durationMinutes: number;
  title: string;
  description?: string | null;
  comment?: string | null;
  externalId?: string | null;
  externalUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user: ActivityRecordUser;
  department: ActivityRecordDictionary;
  activityType: ActivityRecordDictionary;
  activityResult: ActivityRecordDictionary;
};

export type ActivityRecordFilters = {
  userId?: string;
  departmentId?: string;
  activityTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateActivityRecordPayload = {
  userId: string;
  departmentId: string;
  activityTypeId: string;
  activityResultId: string;
  workDate: string;
  durationMinutes: number;
  title: string;
  description?: string;
  comment?: string;
  externalId?: string;
  externalUrl?: string;
};
