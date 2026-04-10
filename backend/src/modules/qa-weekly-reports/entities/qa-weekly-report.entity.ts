class QaWeeklyReportUserEntity {
  id!: string;
  fullName!: string;
  email!: string;
}

class QaWeeklyReportDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

class QaWeeklyBugItemEntity {
  id!: string;
  bucketCode!: string;
  projectName!: string;
  title!: string;
  externalUrl?: string | null;
  severityCode?: string | null;
  resultCode?: string | null;
  sortOrder!: number;
}

class QaWeeklyOtherTaskItemEntity {
  id!: string;
  taskName!: string;
  description?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class QaWeeklyReportEntity {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: QaWeeklyReportUserEntity;
  department!: QaWeeklyReportDepartmentEntity;
  bugItems!: QaWeeklyBugItemEntity[];
  otherTaskItems!: QaWeeklyOtherTaskItemEntity[];
}
