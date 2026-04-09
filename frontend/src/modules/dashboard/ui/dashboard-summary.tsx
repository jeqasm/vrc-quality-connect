import { ActivityRecord } from '../../activity-records/model/activity-record';
import { ReportSummary } from '../model/report-summary';

type DashboardSummaryProps = {
  summary: ReportSummary;
  records: ActivityRecord[];
};

function formatHours(value: number): string {
  return `${value.toFixed(2)} h`;
}

export function DashboardSummary(props: DashboardSummaryProps) {
  const busiestUser = props.summary.totalHoursByUser[0];
  const leadingActivityType = props.summary.totalHoursByActivityType[0];
  const latestRecords = [...props.records]
    .sort((left, right) => right.workDate.localeCompare(left.workDate))
    .slice(0, 5);

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tracked hours</div>
          <div className="stat-value">{formatHours(props.summary.totalHours)}</div>
          <div className="stat-trend">Operational load captured in the selected period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activity records</div>
          <div className="stat-value">{props.summary.totalRecordsCount}</div>
          <div className="stat-trend">Atomic source records for reporting and analytics</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average per record</div>
          <div className="stat-value">
            {formatHours(
              props.summary.totalRecordsCount === 0
                ? 0
                : props.summary.totalHours / props.summary.totalRecordsCount,
            )}
          </div>
          <div className="stat-trend">Mean operational effort per logged item</div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="page-grid">
          <div className="accent-card">
            <h2>Current focus</h2>
            <p className="card-subtitle">
              A compact overview of the current operational pulse based on filtered activity
              records.
            </p>
            <div className="metric-grid">
              <div className="activity-highlight">
                <div className="field-label">Busiest employee</div>
                <strong>{busiestUser?.name ?? 'No data'}</strong>
                <div className="table-secondary">
                  {busiestUser ? formatHours(busiestUser.totalHours) : 'No tracked hours yet'}
                </div>
              </div>
              <div className="activity-highlight">
                <div className="field-label">Leading activity</div>
                <strong>{leadingActivityType?.name ?? 'No data'}</strong>
                <div className="table-secondary">
                  {leadingActivityType
                    ? formatHours(leadingActivityType.totalHours)
                    : 'No tracked hours yet'}
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <h2>Hours by employee</h2>
              <span className="muted-text">{props.summary.totalHoursByUser.length} people</span>
            </div>
            <div className="summary-list">
              {props.summary.totalHoursByUser.map((item) => (
                <div className="summary-row" key={item.id}>
                  <div>
                    <div>{item.name}</div>
                    <div className="muted-text">{item.email}</div>
                  </div>
                  <strong>{formatHours(item.totalHours)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="content-card">
            <div className="section-heading">
              <h2>Hours by activity type</h2>
              <span className="muted-text">
                {props.summary.totalHoursByActivityType.length} categories
              </span>
            </div>
            <div className="summary-list">
              {props.summary.totalHoursByActivityType.map((item) => (
                <div className="summary-row" key={item.id}>
                  <div>{item.name}</div>
                  <strong>{formatHours(item.totalHours)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <h2>Latest records</h2>
              <span className="muted-text">{latestRecords.length} items</span>
            </div>
            <div className="insight-list">
              {latestRecords.map((record) => (
                <div className="insight-row" key={record.id}>
                  <div className="pill-row">
                    <span className="pill">{record.activityType.name}</span>
                    <span className="pill pill-neutral">{formatHours(record.durationMinutes / 60)}</span>
                  </div>
                  <div style={{ marginTop: 10, fontWeight: 600 }}>{record.title}</div>
                  <div className="table-secondary">
                    {record.user.fullName} • {record.department.name} • {record.workDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
