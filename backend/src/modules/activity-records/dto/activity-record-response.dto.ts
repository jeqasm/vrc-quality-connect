class ActivityRecordUserDto {
  id!: string;
  fullName!: string;
  email!: string;
}

class ActivityRecordDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class ActivityRecordDictionaryDto {
  id!: string;
  code!: string;
  name!: string;
}

export class ActivityRecordResponseDto {
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
  user!: ActivityRecordUserDto;
  department!: ActivityRecordDepartmentDto;
  activityType!: ActivityRecordDictionaryDto;
  activityResult!: ActivityRecordDictionaryDto;
}
