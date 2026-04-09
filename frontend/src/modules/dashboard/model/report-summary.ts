export type SummaryGroupItem = {
  id: string;
  code: string;
  name: string;
  totalHours: number;
  email?: string;
};

export type ReportSummary = {
  totalHours: number;
  totalRecordsCount: number;
  totalHoursByUser: SummaryGroupItem[];
  totalHoursByActivityType: SummaryGroupItem[];
};
