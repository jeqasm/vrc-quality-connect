export type ManagementProjectStatusCode =
  | 'in_progress'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export type ManagementWeeklyProjectItem = {
  id: string;
  projectName: string;
  customerName: string;
  description?: string | null;
  statusCode: ManagementProjectStatusCode;
  sortOrder: number;
};

export type ManagementWeeklyOtherTaskItem = {
  id: string;
  taskName: string;
  description?: string | null;
  sortOrder: number;
};

export type ManagementWeeklyCategoryItem = {
  id: string;
  categoryName: string;
  comment?: string | null;
  durationMinutes: number;
  sortOrder: number;
};

export type ManagementWeeklyReport = {
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
  projectItems: ManagementWeeklyProjectItem[];
  otherTaskItems: ManagementWeeklyOtherTaskItem[];
  categoryItems: ManagementWeeklyCategoryItem[];
};

export type SaveManagementWeeklyReportPayload = {
  userId: string;
  departmentId: string;
  weekStart: string;
  weekEnd: string;
  projectItems: Array<{
    projectName: string;
    customerName: string;
    description?: string;
    statusCode: ManagementProjectStatusCode;
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
