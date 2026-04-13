export type SupportProjectStatusCode =
  | 'in_progress'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export type SupportWeeklyProjectItem = {
  id: string;
  projectName: string;
  customerName: string;
  description?: string | null;
  statusCode: SupportProjectStatusCode;
  sortOrder: number;
};

export type SupportWeeklyOtherTaskItem = {
  id: string;
  taskName: string;
  description?: string | null;
  sortOrder: number;
};

export type SupportWeeklyCategoryItem = {
  id: string;
  categoryName: string;
  comment?: string | null;
  durationMinutes: number;
  sortOrder: number;
};

export type SupportWeeklyReport = {
  id: string;
  userId: string;
  departmentId: string;
  weekStart: string;
  weekEnd: string;
  status: string;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  department: {
    id: string;
    code: string;
    name: string;
  };
  projectItems: SupportWeeklyProjectItem[];
  otherTaskItems: SupportWeeklyOtherTaskItem[];
  categoryItems: SupportWeeklyCategoryItem[];
};

export type SaveSupportWeeklyReportPayload = {
  userId: string;
  departmentId: string;
  weekStart: string;
  weekEnd: string;
  projectItems: Array<{
    projectName: string;
    customerName: string;
    description?: string;
    statusCode: SupportProjectStatusCode;
  }>;
  otherTaskItems: Array<{
    taskName: string;
    description?: string;
  }>;
  categoryItems: Array<{
    categoryName: string;
    comment?: string;
    durationMinutes: number;
  }>;
};
