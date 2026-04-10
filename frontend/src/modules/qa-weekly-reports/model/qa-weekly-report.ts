export type QaWeeklyBugItem = {
  id: string;
  bucketCode: string;
  projectName: string;
  title: string;
  externalUrl?: string | null;
  severityCode?: string | null;
  resultCode?: string | null;
  sortOrder: number;
};

export type QaWeeklyOtherTaskItem = {
  id: string;
  taskName: string;
  description?: string | null;
  durationMinutes: number;
  sortOrder: number;
};

export type QaWeeklyReport = {
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
  bugItems: QaWeeklyBugItem[];
  otherTaskItems: QaWeeklyOtherTaskItem[];
};

export type SaveQaWeeklyReportPayload = {
  userId: string;
  departmentId: string;
  weekStart: string;
  weekEnd: string;
  bugItems: Array<{
    bucketCode: string;
    projectName: string;
    title: string;
    externalUrl?: string;
    severityCode?: string;
    resultCode?: string;
  }>;
  otherTaskItems: Array<{
    taskName: string;
    description?: string;
    durationMinutes: number;
  }>;
};
