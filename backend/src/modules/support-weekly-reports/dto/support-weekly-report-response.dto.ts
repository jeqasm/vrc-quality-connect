class SupportWeeklyReportUserDto {
  id!: string;
  fullName!: string;
  email!: string;
}

class SupportWeeklyReportDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class SupportWeeklyProjectItemResponseDto {
  id!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
  sortOrder!: number;
}

class SupportWeeklyOtherTaskItemResponseDto {
  id!: string;
  taskName!: string;
  description?: string | null;
  sortOrder!: number;
}

class SupportWeeklyCategoryItemResponseDto {
  id!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
  sortOrder!: number;
}

export class SupportWeeklyReportResponseDto {
  id!: string;
  userId!: string;
  departmentId!: string;
  weekStart!: string;
  weekEnd!: string;
  status!: string;
  submittedAt?: string | null;
  createdAt!: string;
  updatedAt!: string;
  user!: SupportWeeklyReportUserDto;
  department!: SupportWeeklyReportDepartmentDto;
  projectItems!: SupportWeeklyProjectItemResponseDto[];
  otherTaskItems!: SupportWeeklyOtherTaskItemResponseDto[];
  categoryItems!: SupportWeeklyCategoryItemResponseDto[];
}
