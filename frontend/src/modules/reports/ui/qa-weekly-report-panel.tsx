import { useQuery } from '@tanstack/react-query';
import { RefObject, useRef, useState } from 'react';

import { DateRangeValue } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { getQaWeeklyReportSummary } from '../api/qa-weekly-reports-api';
import { exportHtmlElementToPdf } from '../lib/report-pdf-export';
import {
  QaWeeklyBugTableItem,
  QaWeeklyOtherTaskTableItem,
  QaWeeklyReportSummary,
} from '../model/qa-weekly-report';

const qaSeverityPalette: Record<string, string> = {
  critical: '#b42318',
  high: '#d97706',
  normal: '#2563eb',
  low: '#0f766e',
  unspecified: '#64748b',
};

type QaWeeklyReportPanelProps = {
  dateRange: DateRangeValue;
  reportData?: QaWeeklyReportSummary;
  showExportAction?: boolean;
};

export function QaWeeklyReportPanel(props: QaWeeklyReportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const qaReportQuery = useQuery({
    queryKey: ['qa-weekly-report-summary', props.dateRange],
    queryFn: () => getQaWeeklyReportSummary(props.dateRange),
    enabled: props.reportData === undefined,
  });

  const report = props.reportData ?? qaReportQuery.data;
  const showExportAction = props.showExportAction ?? true;

  if (!report && qaReportQuery.isLoading) {
    return <div className="muted-text">Loading QA reports...</div>;
  }

  if (!report && (qaReportQuery.isError || !qaReportQuery.data)) {
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

  if (!report) {
    return null;
  }

  const exportLabel = isExporting ? 'Экспорт...' : 'Экспорт';
  const severityDistribution = buildSeverityDistribution(report.newBugs);
  return (
    <div className="page-grid">
      <div className="reports-toolbar">
        <div className="reports-toolbar-copy">
          <h2 className="collapsible-title">QA отчет</h2>
          <p className="collapsible-subtitle">
            Сводка по QA-активностям за выбранный период с возможностью выгрузки в PDF.
          </p>
        </div>
        {showExportAction ? (
          <div className="reports-toolbar-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={isExporting}
              onClick={() => void exportQaReportToPdf(exportContainerRef, props.dateRange, setIsExporting)}
            >
              {exportLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="report-export-sheet" ref={exportContainerRef}>
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>QA отчет</h2>
          </div>
          <div className="report-export-meta">
            <div className="pill">Период: {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}</div>
            <div className="pill pill-neutral">Новых багов: {report.totals.totalNewBugs}</div>
          </div>
        </section>

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

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Соотношение багов</h2>
            </div>
          </div>
          <QaBugBalanceSummary
            closedRetestBugs={report.totals.closedRetestBugs}
            totalNewBugs={report.totals.totalNewBugs}
          />
        </section>

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Итоги ретеста</h2>
            </div>
          </div>
          <QaRetestOutcomeSummary
            closedRetestBugs={report.totals.closedRetestBugs}
            sentToReworkRetestBugs={report.totals.sentToReworkRetestBugs}
          />
        </section>

        <section className="reports-grid">
          <div className="content-card report-chart-card">
            <div className="section-heading">
              <h2>Распределение новых багов по критичности</h2>
            </div>
            <QaSeverityDonutChart items={severityDistribution} />
          </div>

          <div className="accent-card report-breakdown-card">
            <div className="section-heading">
              <h2>Структура критичности</h2>
            </div>
            <div className="list">
              {severityDistribution.map((item) => (
                <div className="list-item report-type-row" key={item.key}>
                  <div className="report-type-head">
                    <span
                      className="report-color-chip"
                      style={{ backgroundColor: item.color }}
                    />
                    <strong>{item.label}</strong>
                  </div>
                  <div className="table-secondary">
                    {item.count} багов, {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

async function exportQaReportToPdf(
  exportContainerRef: RefObject<HTMLDivElement | null>,
  dateRange: DateRangeValue,
  setIsExporting: (value: boolean) => void,
) {
  const exportNode = exportContainerRef.current;
  if (!exportNode) {
    return;
  }

  setIsExporting(true);

  try {
    await exportHtmlElementToPdf(exportNode, `qa-report-${dateRange.dateFrom}_to_${dateRange.dateTo}.pdf`);
  } finally {
    setIsExporting(false);
  }
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

function QaBugBalanceSummary(props: {
  closedRetestBugs: number;
  totalNewBugs: number;
}) {
  const total = props.closedRetestBugs + props.totalNewBugs;
  const closedShare = total > 0 ? (props.closedRetestBugs / total) * 100 : 0;
  const newShare = total > 0 ? (props.totalNewBugs / total) * 100 : 0;

  return (
    <div className="qa-bug-balance">
      <div className="qa-bug-balance-bar" aria-label="Соотношение закрытых и новых багов">
        <div
          className="qa-bug-balance-segment qa-bug-balance-segment-closed"
          style={{ width: `${closedShare}%` }}
        />
        <div
          className="qa-bug-balance-segment qa-bug-balance-segment-new"
          style={{ width: `${newShare}%` }}
        />
      </div>

      <div className="qa-bug-balance-legend">
        <div className="qa-bug-balance-item">
          <div className="qa-bug-balance-item-head">
            <span className="qa-bug-balance-dot qa-bug-balance-dot-closed" />
            <span className="qa-bug-balance-item-label">Закрытые баги</span>
          </div>
          <div className="qa-bug-balance-item-value">{props.closedRetestBugs}</div>
          <div className="qa-bug-balance-item-meta">{closedShare.toFixed(0)}%</div>
        </div>

        <div className="qa-bug-balance-item">
          <div className="qa-bug-balance-item-head">
            <span className="qa-bug-balance-dot qa-bug-balance-dot-new" />
            <span className="qa-bug-balance-item-label">Новые баги</span>
          </div>
          <div className="qa-bug-balance-item-value">{props.totalNewBugs}</div>
          <div className="qa-bug-balance-item-meta">{newShare.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}

function QaRetestOutcomeSummary(props: {
  closedRetestBugs: number;
  sentToReworkRetestBugs: number;
}) {
  const totalRetestOutcomes =
    props.closedRetestBugs + props.sentToReworkRetestBugs;
  const closedShare =
    totalRetestOutcomes > 0 ? (props.closedRetestBugs / totalRetestOutcomes) * 100 : 0;
  const reworkShare =
    totalRetestOutcomes > 0 ? (props.sentToReworkRetestBugs / totalRetestOutcomes) * 100 : 0;

  return (
    <div className="qa-bug-balance">
      <div className="qa-retest-outcome-bar" aria-label="Итоги ретеста багов">
        <div
          className="qa-bug-balance-segment qa-bug-balance-segment-closed"
          style={{ width: `${closedShare}%` }}
        />
        <div
          className="qa-bug-balance-segment qa-bug-balance-segment-rework"
          style={{ width: `${reworkShare}%` }}
        />
      </div>

      <div className="qa-bug-balance-legend">
        <div className="qa-bug-balance-item">
          <div className="qa-bug-balance-item-head">
            <span className="qa-bug-balance-dot qa-bug-balance-dot-closed" />
            <span className="qa-bug-balance-item-label">Закрытые</span>
          </div>
          <div className="qa-bug-balance-item-value">{props.closedRetestBugs}</div>
          <div className="qa-bug-balance-item-meta">{closedShare.toFixed(0)}%</div>
        </div>

        <div className="qa-bug-balance-item">
          <div className="qa-bug-balance-item-head">
            <span className="qa-bug-balance-dot qa-bug-balance-dot-rework" />
            <span className="qa-bug-balance-item-label">На доработку</span>
          </div>
          <div className="qa-bug-balance-item-value">{props.sentToReworkRetestBugs}</div>
          <div className="qa-bug-balance-item-meta">{reworkShare.toFixed(0)}%</div>
        </div>
      </div>

      <div className="qa-retest-outcome-note">
        Доля возврата в доработку: <strong>{reworkShare.toFixed(0)}%</strong> от всех итогов ретеста.
      </div>
    </div>
  );
}

function QaSeverityDonutChart(props: {
  items: Array<{
    key: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}) {
  if (props.items.length === 0) {
    return <div className="muted-text">Нет новых багов для распределения по критичности.</div>;
  }

  const radius = 76;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="report-donut-layout">
      <svg viewBox="0 0 220 220" className="report-donut-chart" aria-label="Распределение новых багов по критичности">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="rgba(143, 165, 189, 0.18)"
          strokeWidth={strokeWidth}
        />
        {props.items.map((item) => {
          const segmentLength = (item.percentage / 100) * circumference;
          const circle = (
            <circle
              key={item.key}
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-cumulativeOffset}
              strokeLinecap="butt"
              transform="rotate(-90 110 110)"
              className="report-donut-segment"
            />
          );
          cumulativeOffset += segmentLength;
          return circle;
        })}
        <text x="110" y="102" textAnchor="middle" className="report-donut-total-label">
          New Bugs
        </text>
        <text x="110" y="126" textAnchor="middle" className="report-donut-total-value">
          {props.items.reduce((sum, item) => sum + item.count, 0)}
        </text>
      </svg>

      <div className="report-donut-export" aria-hidden="true">
        <div
          className="report-donut-export-chart"
          style={{
            backgroundImage: buildDonutGradient(
              props.items.map((item) => ({
                percentage: item.percentage,
                color: item.color,
              })),
            ),
          }}
        >
          <div className="report-donut-export-hole">
            <div className="report-donut-export-label">New Bugs</div>
            <div className="report-donut-export-value">
              {props.items.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildDonutGradient(segments: Array<{ percentage: number; color: string }>): string {
  let current = 0;
  const stops: string[] = [];

  for (const segment of segments) {
    const safePercentage = Math.max(0, Math.min(100, segment.percentage));
    if (safePercentage <= 0) {
      continue;
    }

    const next = Math.min(100, current + safePercentage);
    stops.push(`${segment.color} ${current}% ${next}%`);
    current = next;
  }

  if (current < 100) {
    stops.push(`rgba(143, 165, 189, 0.18) ${current}% 100%`);
  }

  return `conic-gradient(${stops.join(', ')})`;
}

function buildSeverityDistribution(items: QaWeeklyBugTableItem[]) {
  const severityBuckets = new Map<string, { key: string; label: string; count: number; color: string }>();

  items.forEach((item) => {
    const severityKey = normalizeSeverityKey(item.severityCode);
    const existingBucket = severityBuckets.get(severityKey);

    if (existingBucket) {
      existingBucket.count += 1;
      return;
    }

    severityBuckets.set(severityKey, {
      key: severityKey,
      label: formatSeverityLabel(severityKey),
      count: 1,
      color: qaSeverityPalette[severityKey] ?? qaSeverityPalette.unspecified,
    });
  });

  const total = items.length;

  return Array.from(severityBuckets.values())
    .map((bucket) => ({
      ...bucket,
      percentage: total > 0 ? Math.round((bucket.count / total) * 100) : 0,
    }))
    .sort((left, right) => severitySortOrder(left.key) - severitySortOrder(right.key));
}

function normalizeSeverityKey(value?: string | null) {
  if (!value) {
    return 'unspecified';
  }

  return value.toLowerCase();
}

function formatSeverityLabel(value: string) {
  switch (value) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Low';
    default:
      return 'Не указано';
  }
}

function severitySortOrder(value: string) {
  switch (value) {
    case 'critical':
      return 0;
    case 'high':
      return 1;
    case 'normal':
      return 2;
    case 'low':
      return 3;
    default:
      return 4;
  }
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateRange(start: string, end: string) {
  return `${formatDate(start)} - ${formatDate(end)}`;
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
