class ManagementWeeklyReportUserDto {
  id!: string;
  fullName!: string;
  email!: string;
}

class ManagementWeeklyReportDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class ManagementWeeklyProjectItemResponseDto {
  id!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
  sortOrder!: number;
}

class ManagementWeeklyOtherTaskItemResponseDto {
  id!: string;
  taskName!: string;
  description?: string | null;
  sortOrder!: number;
}

class ManagementWeeklyCategoryItemResponseDto {
  id!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class ManagementWeeklyReportResponseDto {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: ManagementWeeklyReportUserDto;
  department!: ManagementWeeklyReportDepartmentDto;
  projectItems!: ManagementWeeklyProjectItemResponseDto[];
  otherTaskItems!: ManagementWeeklyOtherTaskItemResponseDto[];
  categoryItems!: ManagementWeeklyCategoryItemResponseDto[];
}
