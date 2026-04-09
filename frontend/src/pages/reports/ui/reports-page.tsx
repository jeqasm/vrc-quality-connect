import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getActivityRecords } from '../../../modules/activity-records/api/activity-records-api';
import { buildReportSummary } from '../../../modules/dashboard/model/build-report-summary';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

const currentWeekDateRange = getCurrentWeekDateRange();

function formatHours(value: number): string {
  return `${value.toFixed(2)} h`;
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    dateFrom: currentWeekDateRange.dateFrom,
    dateTo: currentWeekDateRange.dateTo,
  });

  const recordsQuery = useQuery({
    queryKey: ['reports-records', dateRange],
    queryFn: () => getActivityRecords(dateRange),
  });

  if (recordsQuery.isLoading) {
    return <div className="muted-text">Loading reports...</div>;
  }

  if (recordsQuery.isError || !recordsQuery.data) {
    return (
      <ErrorBlock
        title="Failed to load reports"
        message="Report aggregates are unavailable right now."
        onRetry={() => {
          void recordsQuery.refetch();
        }}
      />
    );
  }

  const summary = buildReportSummary(recordsQuery.data);
  const insights = {
    summary,
    topUsers: summary.totalHoursByUser.slice(0, 3),
    topActivities: summary.totalHoursByActivityType.slice(0, 4),
    fillRate:
      summary.totalRecordsCount === 0
        ? 0
        : Number((summary.totalHours / summary.totalRecordsCount).toFixed(2)),
  };

  return (
    <div className="page-grid">
      <TopBar
        title="Operational reports"
        subtitle="Reusable report surfaces derived from activity records. The layout mirrors the dashboard but focuses on aggregation and review."
        dateRange={<DateRangePicker value={dateRange} onChange={setDateRange} />}
        action={<Link className="primary-button" to="/activity-records?create=1">Add record</Link>}
      />

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tracked hours</div>
          <div className="stat-value">{formatHours(insights.summary.totalHours)}</div>
          <div className="stat-trend">Total operational effort in range</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Records captured</div>
          <div className="stat-value">{insights.summary.totalRecordsCount}</div>
          <div className="stat-trend">Atomic records available for analytics</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average effort</div>
          <div className="stat-value">{formatHours(insights.fillRate)}</div>
          <div className="stat-trend">Average time per activity record</div>
        </div>
      </section>

      <section className="reports-grid">
        <div className="page-grid">
          <div className="content-card">
            <div className="section-heading">
              <h2>Top contributors</h2>
              <span className="muted-text">Top 3 by hours</span>
            </div>
            <div className="summary-list">
              {insights.topUsers.map((item) => (
                <div className="summary-row" key={item.id}>
                  <div>
                    <div>{item.name}</div>
                    <div className="table-secondary">{item.email}</div>
                  </div>
                  <strong>{formatHours(item.totalHours)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <h2>Activity mix</h2>
              <span className="muted-text">Most loaded work categories</span>
            </div>
            <div className="insight-list">
              {insights.topActivities.map((item) => (
                <div className="insight-row" key={item.id}>
                  <div className="pill-row">
                    <span className="pill">{item.name}</span>
                    <span className="pill pill-neutral">{formatHours(item.totalHours)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="accent-card">
            <h2>Report guidance</h2>
            <p className="card-subtitle">
              This surface is structured for later export, comparison periods and saved report
              presets without changing the page contract.
            </p>
            <div className="details-list">
              <div className="details-row">
                <span className="muted-text">Primary source</span>
                <strong>Activity records</strong>
              </div>
              <div className="details-row">
                <span className="muted-text">Aggregation scope</span>
                <strong>Date range controlled</strong>
              </div>
              <div className="details-row">
                <span className="muted-text">Next extension</span>
                <strong>Exports and saved filters</strong>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <h2>Review notes</h2>
              <span className="muted-text">Analyst view</span>
            </div>
            <div className="insight-list">
              <div className="insight-row">
                <strong>
                  {insights.topUsers[0]?.name ?? 'No dominant contributor'} leads the selected
                  period.
                </strong>
                <div className="table-secondary">
                  Highest load currently sits at{' '}
                  {insights.topUsers[0] ? formatHours(insights.topUsers[0].totalHours) : '0.00 h'}.
                </div>
              </div>
              <div className="insight-row">
                <strong>
                  {insights.topActivities[0]?.name ?? 'No dominant activity'} is the dominant work
                  stream.
                </strong>
                <div className="table-secondary">
                  Useful anchor for future variance and trend sections.
                </div>
              </div>
              <div className="insight-row">
                <strong>Average effort per record is {formatHours(insights.fillRate)}.</strong>
                <div className="table-secondary">
                  This can later drive anomaly checks and completion-rate metrics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
