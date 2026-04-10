import { useQuery } from '@tanstack/react-query';

import { DateRangeValue } from '../../../shared/lib/date-range';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { getQaWeeklyReportSummary } from '../api/qa-weekly-reports-api';
import {
  QaWeeklyBugTableItem,
  QaWeeklyOtherTaskTableItem,
} from '../model/qa-weekly-report';

type QaWeeklyReportPanelProps = {
  dateRange: DateRangeValue;
};

export function QaWeeklyReportPanel(props: QaWeeklyReportPanelProps) {
  const qaReportQuery = useQuery({
    queryKey: ['qa-weekly-report-summary', props.dateRange],
    queryFn: () => getQaWeeklyReportSummary(props.dateRange),
  });

  if (qaReportQuery.isLoading) {
    return <div className="muted-text">Loading QA reports...</div>;
  }

  if (qaReportQuery.isError || !qaReportQuery.data) {
    return (
      <ErrorBlock
        title="Failed to load QA report"
        message="QA weekly analytics are unavailable right now."
        onRetry={() => {
          void qaReportQuery.refetch();
        }}
      />
    );
  }

  const report = qaReportQuery.data;

  return (
    <div className="page-grid">
      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Ретестовые баги</h2>
          </div>
          <div className="qa-report-summary-strip">
            <SummaryInlineStat
              label="Закрыто"
              value={`${report.totals.closedRetestBugs}`}
            />
            <SummaryInlineStat
              label="На доработку"
              value={`${report.totals.sentToReworkRetestBugs}`}
            />
          </div>
        </div>
        <QaBugTable
          items={report.retestBugs}
          titleLabel="Название бага"
          linkLabel="Ссылка на баг"
          showSeverity
          showStatus
          emptyMessage="Нет ретестовых багов за период."
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Новые баги</h2>
          </div>
          <div className="qa-report-summary-strip">
            <SummaryInlineStat
              label="Всего найдено"
              value={`${report.totals.totalNewBugs}`}
            />
          </div>
        </div>
        <QaBugTable
          items={report.newBugs}
          titleLabel="Название бага"
          linkLabel="Ссылка на баг"
          showSeverity
          showStatus={false}
          emptyMessage="Нет новых багов за период."
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Протестированные задачи</h2>
          </div>
          <div className="qa-report-summary-strip">
            <SummaryInlineStat
              label="Всего протестировано"
              value={`${report.totals.totalTestedTasks}`}
            />
          </div>
        </div>
        <QaBugTable
          items={report.testedTasks}
          titleLabel="Название задачи"
          linkLabel="Ссылка на задачу"
          showSeverity={false}
          showStatus
          emptyMessage="Нет протестированных задач за период."
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Новые задачи</h2>
          </div>
          <div className="qa-report-summary-strip">
            <SummaryInlineStat
              label="Всего создано"
              value={`${report.totals.totalNewTasks}`}
            />
          </div>
        </div>
        <QaBugTable
          items={report.newTasks}
          titleLabel="Название задачи"
          linkLabel="Ссылка на задачу"
          showSeverity={false}
          showStatus={false}
          emptyMessage="Нет новых задач за период."
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Прочие задачи</h2>
          </div>
          <div className="qa-report-summary-strip">
            <SummaryInlineStat
              label="Всего часов"
              value={`${report.totals.totalOtherTaskHours}`}
            />
          </div>
        </div>
        <QaOtherTaskTable items={report.otherTasks} />
      </section>
    </div>
  );
}

function SummaryInlineStat(props: { label: string; value: string }) {
  return (
    <div className="qa-report-inline-stat">
      <span className="qa-report-inline-label">{props.label}</span>
      <span className="qa-report-inline-value">{props.value}</span>
    </div>
  );
}

function QaBugTable(props: {
  items: QaWeeklyBugTableItem[];
  titleLabel: string;
  linkLabel: string;
  showSeverity?: boolean;
  showStatus?: boolean;
  emptyMessage: string;
}) {
  const showSeverity = props.showSeverity ?? true;
  const showStatus = props.showStatus ?? true;

  if (props.items.length === 0) {
    return <div className="muted-text">{props.emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Период</th>
            <th>Сотрудник</th>
            <th>Проект</th>
            <th>{props.titleLabel}</th>
            {showSeverity ? <th>Влияние</th> : null}
            {showStatus ? <th>Текущий статус</th> : null}
            <th>{props.linkLabel}</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, index) => (
            <tr key={`${item.userId}-${item.weekStart}-${item.title}-${index}`}>
              <td>
                <div className="report-period-cell">
                  <div>{formatWeekRange(item.weekStart).start}</div>
                  <div>{formatWeekRange(item.weekStart).end}</div>
                </div>
              </td>
              <td>{item.userFullName}</td>
              <td>{item.projectName}</td>
              <td>{item.title}</td>
              {showSeverity ? <td>{formatSeverity(item.severityCode)}</td> : null}
              {showStatus ? <td>{formatStatus(item.resultCode)}</td> : null}
              <td>
                {item.externalUrl ? (
                  <a
                    className="report-link"
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QaOtherTaskTable(props: { items: QaWeeklyOtherTaskTableItem[] }) {
  if (props.items.length === 0) {
    return <div className="muted-text">Нет прочих задач за период.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Период</th>
            <th>Сотрудник</th>
            <th>Задача</th>
            <th>Краткое описание</th>
            <th>Часы</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, index) => (
            <tr key={`${item.userId}-${item.weekStart}-${item.taskName}-${index}`}>
              <td>
                <div className="report-period-cell">
                  <div>{formatWeekRange(item.weekStart).start}</div>
                  <div>{formatWeekRange(item.weekStart).end}</div>
                </div>
              </td>
              <td>{item.userFullName}</td>
              <td>{item.taskName}</td>
              <td>{item.description ?? '—'}</td>
              <td>{formatHours(item.durationMinutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  return {
    start: formatDate(weekStart),
    end: end.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  };
}

function formatHours(durationMinutes: number) {
  return `${Math.round((durationMinutes / 60) * 100) / 100}`;
}

function formatSeverity(value?: string | null) {
  if (!value) {
    return '—';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(value?: string | null) {
  switch (value) {
    case 'resolved':
      return 'Решен';
    case 'rework':
    case 'sent_to_rework':
    case 'sent-to-rework':
      return 'На доработке';
    case 'blocked':
      return 'Заблокирован';
    default:
      return value ?? '—';
  }
}
