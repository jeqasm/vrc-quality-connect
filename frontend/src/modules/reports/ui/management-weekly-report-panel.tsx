import { useQuery } from '@tanstack/react-query';
import { RefObject, useRef, useState } from 'react';

import { getManagementWeeklyReportSummary } from '../api/management-weekly-reports-api';
import {
  ManagementProjectStatusCode,
  ManagementWeeklyCategoryHoursItem,
  ManagementWeeklyCategoryTableItem,
  ManagementWeeklyOtherTaskTableItem,
  ManagementWeeklyProjectTableItem,
  ManagementWeeklyReportSummary,
} from '../model/management-weekly-report';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { exportHtmlElementToPdf } from '../lib/report-pdf-export';

const managementReportPalette = ['#0f766e', '#2563eb', '#d97706', '#be185d', '#7c3aed', '#0891b2'];

type ManagementWeeklyReportPanelProps = {
  dateRange: DateRangeValue;
  reportData?: ManagementWeeklyReportSummary;
  showExportAction?: boolean;
};

export function ManagementWeeklyReportPanel(props: ManagementWeeklyReportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const managementReportQuery = useQuery({
    queryKey: ['management-weekly-report-summary', props.dateRange],
    queryFn: () => getManagementWeeklyReportSummary(props.dateRange),
    enabled: props.reportData === undefined,
  });

  const report = props.reportData ?? managementReportQuery.data;
  const showExportAction = props.showExportAction ?? true;

  if (!report && managementReportQuery.isLoading) {
    return <div className="muted-text">Loading Management reports...</div>;
  }

  if (!report && (managementReportQuery.isError || !managementReportQuery.data)) {
    return (
      <ErrorBlock
        title="Failed to load Management report"
        message="Management weekly analytics are unavailable right now."
        onRetry={() => {
          void managementReportQuery.refetch();
        }}
      />
    );
  }

  if (!report) {
    return null;
  }

  const exportLabel = isExporting ? 'Экспорт...' : 'Экспорт';

  return (
    <div className="page-grid">
      <div className="reports-toolbar">
        <div className="reports-toolbar-copy">
          <h2 className="collapsible-title">Management отчет</h2>
          <p className="collapsible-subtitle">
            Недельная сводка по проектной работе, прочим задачам и управленческим категориям.
          </p>
        </div>
        {showExportAction ? (
          <div className="reports-toolbar-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={isExporting}
              onClick={() => void exportManagementReportToPdf(exportContainerRef, props.dateRange, setIsExporting)}
            >
              {exportLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="report-export-sheet" ref={exportContainerRef}>
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>Management отчет</h2>
          </div>
          <div className="report-export-meta">
            <div className="pill">Период: {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}</div>
            <div className="pill pill-neutral">Проектов: {report.totals.totalProjects}</div>
            <div className="pill pill-neutral">Часов по категориям: {report.totals.totalCategoryHours}</div>
          </div>
        </section>

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Работа над проектами</h2>
            </div>
            <div className="qa-report-summary-strip">
              <SummaryInlineStat label="Всего проектов" value={`${report.totals.totalProjects}`} />
            </div>
          </div>
          <ManagementProjectTable items={report.projectItems} />
        </section>

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Прочие задачи</h2>
            </div>
            <div className="qa-report-summary-strip">
              <SummaryInlineStat label="Всего задач" value={`${report.totals.totalOtherTasks}`} />
            </div>
          </div>
          <ManagementOtherTasksTable items={report.otherTaskItems} />
        </section>

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Задачи по категориям</h2>
            </div>
            <div className="qa-report-summary-strip">
              <SummaryInlineStat label="Суммарно часов" value={`${report.totals.totalCategoryHours}`} />
            </div>
          </div>
          <ManagementCategoryTable items={report.categoryItems} />
        </section>

        <section className="reports-grid">
          <div className="content-card report-chart-card">
            <div className="section-heading">
              <h2>Распределение часов по категориям</h2>
            </div>
            <ManagementCategoryDonutChart
              items={report.categoryHours}
              activeCategory={activeCategory}
              onActiveCategoryChange={setActiveCategory}
            />
          </div>

          <div className="accent-card report-breakdown-card">
            <div className="section-heading">
              <h2>Структура категорий</h2>
            </div>
            <div className="list">
              {report.categoryHours.map((item, index) => (
                <div
                  className={`list-item report-type-row${activeCategory === item.categoryName ? ' report-type-row-active' : ''}`}
                  key={item.categoryName}
                  onMouseEnter={() => setActiveCategory(item.categoryName)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className="report-type-head">
                    <span
                      className="report-color-chip"
                      style={{ backgroundColor: managementReportPalette[index % managementReportPalette.length] }}
                    />
                    <strong>{item.categoryName}</strong>
                  </div>
                  <div className="table-secondary">
                    {item.hours} ч, {item.percentage}%
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

async function exportManagementReportToPdf(
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
    await exportHtmlElementToPdf(exportNode, `management-report-${dateRange.dateFrom}_to_${dateRange.dateTo}.pdf`);
  } finally {
    setIsExporting(false);
  }
}

function ManagementProjectTable(props: { items: ManagementWeeklyProjectTableItem[] }) {
  if (props.items.length === 0) {
    return <div className="muted-text">Нет проектной работы за период.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Период</th>
            <th>Сотрудник</th>
            <th>Название проекта</th>
            <th>Заказчик</th>
            <th>Краткое описание</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, index) => (
            <tr key={`${item.userId}-${item.weekStart}-${item.projectName}-${index}`}>
              <td>
                <div className="report-period-cell">
                  <div>{formatWeekRange(item.weekStart).start}</div>
                  <div>{formatWeekRange(item.weekStart).end}</div>
                </div>
              </td>
              <td>{item.userFullName}</td>
              <td>{item.projectName}</td>
              <td>{item.customerName}</td>
              <td>{item.description ?? '—'}</td>
              <td>
                <span className={`support-status-pill support-status-${item.statusCode}`}>
                  {formatManagementProjectStatus(item.statusCode)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagementOtherTasksTable(props: { items: ManagementWeeklyOtherTaskTableItem[] }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagementCategoryTable(props: { items: ManagementWeeklyCategoryTableItem[] }) {
  if (props.items.length === 0) {
    return <div className="muted-text">Нет задач по категориям за период.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Период</th>
            <th>Сотрудник</th>
            <th>Категория</th>
            <th>Комментарий</th>
            <th>Часы</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, index) => (
            <tr key={`${item.userId}-${item.weekStart}-${item.categoryName}-${index}`}>
              <td>
                <div className="report-period-cell">
                  <div>{formatWeekRange(item.weekStart).start}</div>
                  <div>{formatWeekRange(item.weekStart).end}</div>
                </div>
              </td>
              <td>{item.userFullName}</td>
              <td>{item.categoryName}</td>
              <td>{item.comment ?? '—'}</td>
              <td>{formatHours(item.durationMinutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagementCategoryDonutChart(props: {
  items: ManagementWeeklyCategoryHoursItem[];
  activeCategory: string | null;
  onActiveCategoryChange: (value: string | null) => void;
}) {
  if (props.items.length === 0) {
    return <div className="muted-text">Нет данных для построения диаграммы.</div>;
  }

  const radius = 76;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;
  const totalHours = props.items.reduce((sum, item) => sum + item.hours, 0);

  return (
    <div className="report-donut-layout">
      <svg viewBox="0 0 220 220" className="report-donut-chart" aria-label="Management category distribution">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="rgba(143, 165, 189, 0.18)"
          strokeWidth={strokeWidth}
        />
        {props.items.map((item, index) => {
          const segmentLength = (item.percentage / 100) * circumference;
          const isActive = props.activeCategory === item.categoryName;
          const hasActiveSelection = props.activeCategory !== null;
          const circle = (
            <circle
              key={item.categoryName}
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={managementReportPalette[index % managementReportPalette.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-cumulativeOffset}
              transform="rotate(-90 110 110)"
              className={isActive ? 'report-donut-segment-active' : 'report-donut-segment'}
              style={{
                opacity: hasActiveSelection && !isActive ? 0.28 : 1,
                filter: isActive ? 'drop-shadow(0 0 8px rgba(23, 32, 51, 0.16))' : 'none',
              }}
              onMouseEnter={() => props.onActiveCategoryChange(item.categoryName)}
              onMouseLeave={() => props.onActiveCategoryChange(null)}
            />
          );
          cumulativeOffset += segmentLength;
          return circle;
        })}
        <text x="110" y="102" textAnchor="middle" className="report-donut-total-label">
          Hours
        </text>
        <text x="110" y="126" textAnchor="middle" className="report-donut-total-value">
          {totalHours}
        </text>
      </svg>

      <div className="report-donut-export" aria-hidden="true">
        <div
          className="report-donut-export-chart"
          style={{
            backgroundImage: buildDonutGradient(
              props.items.map((item, index) => ({
                percentage: item.percentage,
                color: managementReportPalette[index % managementReportPalette.length],
              })),
            ),
          }}
        >
          <div className="report-donut-export-hole">
            <div className="report-donut-export-label">Hours</div>
            <div className="report-donut-export-value">{totalHours}</div>
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

function SummaryInlineStat(props: { label: string; value: string }) {
  return (
    <div className="qa-report-inline-stat">
      <span className="qa-report-inline-label">{props.label}</span>
      <span className="qa-report-inline-value">{props.value}</span>
    </div>
  );
}

function formatManagementProjectStatus(statusCode: ManagementProjectStatusCode) {
  switch (statusCode) {
    case 'in_progress':
      return 'В работе';
    case 'in_review':
      return 'На проверке';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    default:
      return statusCode;
  }
}

function formatDateRange(start: string, end: string) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
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
    end: formatDate(end.toISOString().slice(0, 10)),
  };
}

function formatHours(durationMinutes: number) {
  return `${Math.round((durationMinutes / 60) * 100) / 100}`;
}
