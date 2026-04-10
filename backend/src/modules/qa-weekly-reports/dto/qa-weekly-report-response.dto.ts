class QaWeeklyReportUserDto {
  id!: string;
  fullName!: string;
  email!: string;
}

class QaWeeklyReportDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class QaWeeklyBugItemResponseDto {
  id!: string;
  bucketCode!: string;
  projectName!: string;
  title!: string;
  externalUrl?: string | null;
  severityCode?: string | null;
  resultCode?: string | null;
  sortOrder!: number;
}

class QaWeeklyOtherTaskItemResponseDto {
  id!: string;
  taskName!: string;
  description?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class QaWeeklyReportResponseDto {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: QaWeeklyReportUserDto;
  department!: QaWeeklyReportDepartmentDto;
  bugItems!: QaWeeklyBugItemResponseDto[];
  otherTaskItems!: QaWeeklyOtherTaskItemResponseDto[];
}
