class SupportWeeklyReportUserEntity {
  id!: string;
  fullName!: string;
  email!: string;
}

class SupportWeeklyReportDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

class SupportWeeklyProjectItemEntity {
  id!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
  sortOrder!: number;
}

class SupportWeeklyOtherTaskItemEntity {
  id!: string;
  taskName!: string;
  description?: string | null;
  sortOrder!: number;
}

class SupportWeeklyCategoryItemEntity {
  id!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class SupportWeeklyReportEntity {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: SupportWeeklyReportUserEntity;
  department!: SupportWeeklyReportDepartmentEntity;
  projectItems!: SupportWeeklyProjectItemEntity[];
  otherTaskItems!: SupportWeeklyOtherTaskItemEntity[];
  categoryItems!: SupportWeeklyCategoryItemEntity[];
}
