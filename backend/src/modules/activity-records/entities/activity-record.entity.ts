class ActivityRecordUserEntity {
  id!: string;
  fullName!: string;
  email!: string;
}

class ActivityRecordDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

class ActivityRecordDictionaryEntity {
  id!: string;
  code!: string;
  name!: string;
}

export class ActivityRecordEntity {
  id!: string;
  userId!: string;
  departmentId!: string;
  activityTypeId!: string;
  activityResultId!: string;
  workDate!: string;
  durationMinutes!: number;
  title!: string;
  description?: string | null;
  comment?: string | null;
  externalId?: string | null;
  externalUrl?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: ActivityRecordUserEntity;
  department!: ActivityRecordDepartmentEntity;
  activityType!: ActivityRecordDictionaryEntity;
  activityResult!: ActivityRecordDictionaryEntity;
}
