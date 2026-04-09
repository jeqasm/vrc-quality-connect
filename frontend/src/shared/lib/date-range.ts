export type DateRangeValue = {
  dateFrom: string;
  dateTo: string;
};

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekDateRange(now: Date = new Date()): DateRangeValue {
  const current = new Date(now);
  current.setHours(0, 0, 0, 0);

  const dayOfWeek = current.getDay();
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const start = new Date(current);
  start.setDate(current.getDate() - distanceToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  return {
    dateFrom: toIsoDate(start),
    dateTo: toIsoDate(end),
  };
}
