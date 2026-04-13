class SupportWeeklyProjectTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  projectName!: string;
  customerName!: string;
  description?: string | null;
  statusCode!: string;
}

class SupportWeeklyOtherTaskTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  taskName!: string;
  description?: string | null;
}

class SupportWeeklyCategoryTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  categoryName!: string;
  comment?: string | null;
  durationMinutes!: number;
}

class SupportWeeklyCategoryHoursItemResponseDto {
  categoryName!: string;
  durationMinutes!: number;
  hours!: number;
  percentage!: number;
}

class SupportWeeklyReportTotalsResponseDto {
  totalProjects!: number;
  inProgressProjects!: number;
  inReviewProjects!: number;
  completedProjects!: number;
  cancelledProjects!: number;
  totalOtherTasks!: number;
  totalCategoryHours!: number;
}

export class SupportWeeklyReportResponseDto {
  dateFrom!: string;
  dateTo!: string;
  totals!: SupportWeeklyReportTotalsResponseDto;
  projectItems!: SupportWeeklyProjectTableItemResponseDto[];
  otherTaskItems!: SupportWeeklyOtherTaskTableItemResponseDto[];
  categoryItems!: SupportWeeklyCategoryTableItemResponseDto[];
  categoryHours!: SupportWeeklyCategoryHoursItemResponseDto[];
}
