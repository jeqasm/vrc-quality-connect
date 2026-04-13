export type SupportProjectStatusCode =
  | 'in_progress'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export type SupportWeeklyProjectTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  projectName: string;
  customerName: string;
  description?: string | null;
  statusCode: SupportProjectStatusCode;
};

export type SupportWeeklyOtherTaskTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  taskName: string;
  description?: string | null;
};

export type SupportWeeklyCategoryTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  categoryName: string;
  comment?: string | null;
  durationMinutes: number;
};

export type SupportWeeklyCategoryHoursItem = {
  categoryName: string;
  durationMinutes: number;
  hours: number;
  percentage: number;
};

export type SupportWeeklyReportTotals = {
  totalProjects: number;
  inProgressProjects: number;
  inReviewProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  totalOtherTasks: number;
  totalCategoryHours: number;
};

export type SupportWeeklyReportSummary = {
  dateFrom: string;
  dateTo: string;
  totals: SupportWeeklyReportTotals;
  projectItems: SupportWeeklyProjectTableItem[];
  otherTaskItems: SupportWeeklyOtherTaskTableItem[];
  categoryItems: SupportWeeklyCategoryTableItem[];
  categoryHours: SupportWeeklyCategoryHoursItem[];
};
