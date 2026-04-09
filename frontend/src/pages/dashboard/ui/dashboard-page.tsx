import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getActivityRecords } from '../../../modules/activity-records/api/activity-records-api';
import { buildReportSummary } from '../../../modules/dashboard/model/build-report-summary';
import { DashboardSummary } from '../../../modules/dashboard/ui/dashboard-summary';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

const currentWeekDateRange = getCurrentWeekDateRange();

export function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    dateFrom: currentWeekDateRange.dateFrom,
    dateTo: currentWeekDateRange.dateTo,
  });

  const recordsQuery = useQuery({
    queryKey: ['dashboard-records', dateRange],
    queryFn: () => getActivityRecords(dateRange),
  });

  if (recordsQuery.isLoading) {
    return <div className="muted-text">Loading dashboard...</div>;
  }

  if (recordsQuery.isError || !recordsQuery.data) {
    return (
      <ErrorBlock
        title="Failed to load dashboard"
        message="Dashboard metrics are unavailable right now."
        onRetry={() => {
          void recordsQuery.refetch();
        }}
      />
    );
  }

  const summary = buildReportSummary(recordsQuery.data);

  return (
    <div className="page-grid">
      <TopBar
        title="Operations dashboard"
        subtitle="A compact operational view built directly on activity records. Use the shared date range to focus on current workload and team distribution."
        dateRange={<DateRangePicker value={dateRange} onChange={setDateRange} />}
        action={<Link className="primary-button" to="/activity-records?create=1">Add record</Link>}
      />
      <DashboardSummary summary={summary} records={recordsQuery.data} />
    </div>
  );
}
