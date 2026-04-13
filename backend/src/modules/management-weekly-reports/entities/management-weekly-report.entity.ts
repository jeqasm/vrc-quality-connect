class ManagementWeeklyReportUserEntity {
  id!: string;
  fullName!: string;
  email!: string;
}

class ManagementWeeklyReportDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

class ManagementWeeklyProjectItemEntity {
  id!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
  sortOrder!: number;
}

class ManagementWeeklyOtherTaskItemEntity {
  id!: string;
  taskName!: string;
  description?: string | null;
  sortOrder!: number;
}

class ManagementWeeklyCategoryItemEntity {
  id!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class ManagementWeeklyReportEntity {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: ManagementWeeklyReportUserEntity;
  department!: ManagementWeeklyReportDepartmentEntity;
  projectItems!: ManagementWeeklyProjectItemEntity[];
  otherTaskItems!: ManagementWeeklyOtherTaskItemEntity[];
  categoryItems!: ManagementWeeklyCategoryItemEntity[];
}
