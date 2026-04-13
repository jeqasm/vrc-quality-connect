class ManagementWeeklyProjectTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
}

class ManagementWeeklyOtherTaskTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  taskName!: string;
  description?: string | null;
}

class ManagementWeeklyCategoryTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
}

class ManagementWeeklyCategoryHoursItemResponseDto {
  categoryName!: string;
  durationMinutes!: number;
  hours!: number;
  percentage!: number;
}

class ManagementWeeklyReportTotalsResponseDto {
  totalProjects!: number;
  inProgressProjects!: number;
  inReviewProjects!: number;
  completedProjects!: number;
  cancelledProjects!: number;
  totalOtherTasks!: number;
  totalCategoryHours!: number;
}

export class ManagementWeeklyReportResponseDto {
  dateFrom!: string;
  dateTo!: string;
  totals!: ManagementWeeklyReportTotalsResponseDto;
  projectItems!: ManagementWeeklyProjectTableItemResponseDto[];
  otherTaskItems!: ManagementWeeklyOtherTaskTableItemResponseDto[];
  categoryItems!: ManagementWeeklyCategoryTableItemResponseDto[];
  categoryHours!: ManagementWeeklyCategoryHoursItemResponseDto[];
}
