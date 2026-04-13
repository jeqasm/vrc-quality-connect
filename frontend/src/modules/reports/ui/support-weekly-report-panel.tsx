import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { RefObject, useRef, useState } from 'react';

import { getSupportWeeklyReportSummary } from '../api/support-weekly-reports-api';
import {
  SupportProjectStatusCode,
  SupportWeeklyCategoryHoursItem,
  SupportWeeklyCategoryTableItem,
  SupportWeeklyOtherTaskTableItem,
  SupportWeeklyProjectTableItem,
} from '../model/support-weekly-report';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';

const supportReportPalette = ['#0f766e', '#2563eb', '#d97706', '#be185d', '#7c3aed', '#0891b2'];

type SupportWeeklyReportPanelProps = {
  dateRange: DateRangeValue;
};

export function SupportWeeklyReportPanel(props: SupportWeeklyReportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const supportReportQuery = useQuery({
    queryKey: ['support-weekly-report-summary', props.dateRange],
    queryFn: () => getSupportWeeklyReportSummary(props.dateRange),
  });

  if (supportReportQuery.isLoading) {
    return <div className="muted-text">Loading Technical Support reports...</div>;
  }

  if (supportReportQuery.isError || !supportReportQuery.data) {
    return (
      <ErrorBlock
        title="Failed to load Technical Support report"
        message="Support weekly analytics are unavailable right now."
        onRetry={() => {
          void supportReportQuery.refetch();
        }}
      />
    );
  }

  const report = supportReportQuery.data;
  const statusItems = [
    { key: 'in_progress', label: 'В работе', color: '#0f766e', count: report.totals.inProgressProjects },
    { key: 'in_review', label: 'На проверке', color: '#2563eb', count: report.totals.inReviewProjects },
    { key: 'completed', label: 'Завершен', color: '#d97706', count: report.totals.completedProjects },
    { key: 'cancelled', label: 'Отменен', color: '#be185d', count: report.totals.cancelledProjects },
  ] as const;
  const exportLabel = isExporting ? 'Экспорт...' : 'Экспорт';

  return (
    <div className="page-grid">
      <div className="reports-toolbar">
        <div className="reports-toolbar-copy">
          <h2 className="collapsible-title">Technical Support отчет</h2>
          <p className="collapsible-subtitle">
            Недельная сводка по проектной работе, прочим задачам и категориям поддержки.
          </p>
        </div>
        <div className="reports-toolbar-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={isExporting}
            onClick={() => void exportSupportReportToPdf(exportContainerRef, props.dateRange, setIsExporting)}
          >
            {exportLabel}
          </Button>
        </div>
      </div>

      <div className="report-export-sheet" ref={exportContainerRef}>
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>Technical Support отчет</h2>
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
          <SupportProjectTable items={report.projectItems} />
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
          <SupportOtherTasksTable items={report.otherTaskItems} />
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
          <SupportCategoryTable items={report.categoryItems} />
        </section>

        <section className="content-card">
          <div className="qa-report-section-head">
            <div className="section-heading">
              <h2>Статусы проектов</h2>
            </div>
          </div>
          <SupportProjectStatusSummary items={statusItems} />
        </section>

        <section className="reports-grid">
          <div className="content-card report-chart-card">
            <div className="section-heading">
              <h2>Распределение часов по категориям</h2>
            </div>
            <SupportCategoryDonutChart
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
                      style={{ backgroundColor: supportReportPalette[index % supportReportPalette.length] }}
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

async function exportSupportReportToPdf(
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
    const imageDataUrl = await toPng(exportNode, {
      cacheBust: true,
      backgroundColor: '#edf4fb',
      pixelRatio: 2,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageProps = pdf.getImageProperties(imageDataUrl);
    const imageWidth = pageWidth;
    const imageHeight = (imageProps.height * imageWidth) / imageProps.width;

    let renderedHeight = imageHeight;
    let offsetY = 0;

    pdf.addImage(imageDataUrl, 'PNG', 0, offsetY, imageWidth, imageHeight);
    renderedHeight -= pageHeight;

    while (renderedHeight > 0) {
      offsetY = renderedHeight - imageHeight;
      pdf.addPage();
      pdf.addImage(imageDataUrl, 'PNG', 0, offsetY, imageWidth, imageHeight);
      renderedHeight -= pageHeight;
    }

    pdf.save(`technical-support-report-${dateRange.dateFrom}_to_${dateRange.dateTo}.pdf`);
  } finally {
    setIsExporting(false);
  }
}

function SupportProjectTable(props: { items: SupportWeeklyProjectTableItem[] }) {
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
                  {formatSupportProjectStatus(item.statusCode)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupportOtherTasksTable(props: { items: SupportWeeklyOtherTaskTableItem[] }) {
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

function SupportCategoryTable(props: { items: SupportWeeklyCategoryTableItem[] }) {
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

function SupportProjectStatusSummary(props: {
  items: ReadonlyArray<{ key: string; label: string; color: string; count: number }>;
}) {
  const total = props.items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="support-status-summary">
      <div className="support-status-bar">
        {props.items.map((item) => {
          const share = total > 0 ? (item.count / total) * 100 : 0;

          return (
            <div
              key={item.key}
              className="support-status-segment"
              style={{
                width: `${share}%`,
                minWidth: item.count > 0 ? '48px' : '0',
                backgroundColor: item.color,
              }}
            >
              {item.count > 0 ? item.count : ''}
            </div>
          );
        })}
      </div>

      <div className="support-status-grid">
        {props.items.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0;

          return (
            <div className="support-status-card" key={item.key}>
              <div className="support-status-card-head">
                <span className="report-color-chip" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
              <strong>{item.count}</strong>
              <span className="table-secondary">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupportCategoryDonutChart(props: {
  items: SupportWeeklyCategoryHoursItem[];
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
      <svg viewBox="0 0 220 220" className="report-donut-chart" aria-label="Support category distribution">
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
              stroke={supportReportPalette[index % supportReportPalette.length]}
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

function formatSupportProjectStatus(statusCode: SupportProjectStatusCode) {
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
