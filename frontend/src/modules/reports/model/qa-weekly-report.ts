export type QaWeeklyBugTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  projectName: string;
  title: string;
  externalUrl?: string | null;
  severityCode?: string | null;
  resultCode?: string | null;
};

export type QaWeeklyOtherTaskTableItem = {
  weekStart: string;
  userId: string;
  userFullName: string;
  taskName: string;
  description?: string | null;
  durationMinutes: number;
};

export type QaWeeklyReportTotals = {
  closedRetestBugs: number;
  sentToReworkRetestBugs: number;
  totalNewBugs: number;
  totalTestedTasks: number;
  totalNewTasks: number;
  totalOtherTaskHours: number;
};

export type QaWeeklyReportSummary = {
  dateFrom: string;
  dateTo: string;
  totals: QaWeeklyReportTotals;
  retestBugs: QaWeeklyBugTableItem[];
  newBugs: QaWeeklyBugTableItem[];
  testedTasks: QaWeeklyBugTableItem[];
  newTasks: QaWeeklyBugTableItem[];
  otherTasks: QaWeeklyOtherTaskTableItem[];
};
