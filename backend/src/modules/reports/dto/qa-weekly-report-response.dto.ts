class QaWeeklyBugTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  projectName!: string;
  title!: string;
  externalUrl?: string | null;
  severityCode?: string | null;
  resultCode?: string | null;
}

class QaWeeklyOtherTaskTableItemResponseDto {
  weekStart!: string;
  userId!: string;
  userFullName!: string;
  taskName!: string;
  description?: string | null;
  durationMinutes!: number;
}

class QaWeeklyReportTotalsResponseDto {
  closedRetestBugs!: number;
  sentToReworkRetestBugs!: number;
  totalNewBugs!: number;
  totalTestedTasks!: number;
  totalNewTasks!: number;
  totalOtherTaskHours!: number;
}

export class QaWeeklyReportResponseDto {
  dateFrom!: string;
  dateTo!: string;
  totals!: QaWeeklyReportTotalsResponseDto;
  retestBugs!: QaWeeklyBugTableItemResponseDto[];
  newBugs!: QaWeeklyBugTableItemResponseDto[];
  testedTasks!: QaWeeklyBugTableItemResponseDto[];
  newTasks!: QaWeeklyBugTableItemResponseDto[];
  otherTasks!: QaWeeklyOtherTaskTableItemResponseDto[];
}
