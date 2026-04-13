export type ManagementProjectStatusCode =
  | 'in_progress'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export type ManagementWeeklyProjectTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  projectName: string;
  customerName: string;
  description?: string | null;
  statusCode: ManagementProjectStatusCode;
};

export type ManagementWeeklyOtherTaskTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  taskName: string;
  description?: string | null;
};

export type ManagementWeeklyCategoryTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  categoryName: string;
  comment?: string | null;
  durationMinutes: number;
};

export type ManagementWeeklyCategoryHoursItem = {
  categoryName: string;
  durationMinutes: number;
  hours: number;
  percentage: number;
};

export type ManagementWeeklyReportTotals = {
  totalProjects: number;
  inProgressProjects: number;
  inReviewProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  totalOtherTasks: number;
  totalCategoryHours: number;
};

export type ManagementWeeklyReportSummary = {
  dateFrom: string;
  dateTo: string;
  totals: ManagementWeeklyReportTotals;
  projectItems: ManagementWeeklyProjectTableItem[];
  otherTaskItems: ManagementWeeklyOtherTaskTableItem[];
  categoryItems: ManagementWeeklyCategoryTableItem[];
  categoryHours: ManagementWeeklyCategoryHoursItem[];
};
