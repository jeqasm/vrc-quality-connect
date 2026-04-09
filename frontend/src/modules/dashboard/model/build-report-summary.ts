import { ActivityRecord } from '../../activity-records/model/activity-record';
import { ReportSummary, SummaryGroupItem } from './report-summary';

function roundHours(value: number): number {
  return Math.round(value * 100) / 100;
}

function sortSummaryItems(items: SummaryGroupItem[]): SummaryGroupItem[] {
  return [...items].sort((left, right) => right.totalHours - left.totalHours);
}

export function buildReportSummary(records: ActivityRecord[]): ReportSummary {
  const hoursByUser = new Map<string, SummaryGroupItem>();
  const hoursByActivityType = new Map<string, SummaryGroupItem>();

  let totalHours = 0;

  for (const record of records) {
    const recordHours = record.durationMinutes / 60;
    totalHours += recordHours;

    const userItem = hoursByUser.get(record.user.id) ?? {
      id: record.user.id,
      code: record.user.email,
      name: record.user.fullName,
      email: record.user.email,
      totalHours: 0,
    };

    userItem.totalHours = roundHours(userItem.totalHours + recordHours);
    hoursByUser.set(record.user.id, userItem);

    const activityTypeItem = hoursByActivityType.get(record.activityType.id) ?? {
      id: record.activityType.id,
      code: record.activityType.code,
      name: record.activityType.name,
      totalHours: 0,
    };

    activityTypeItem.totalHours = roundHours(activityTypeItem.totalHours + recordHours);
    hoursByActivityType.set(record.activityType.id, activityTypeItem);
  }

  return {
    totalHours: roundHours(totalHours),
    totalRecordsCount: records.length,
    totalHoursByUser: sortSummaryItems([...hoursByUser.values()]),
    totalHoursByActivityType: sortSummaryItems([...hoursByActivityType.values()]),
  };
}
