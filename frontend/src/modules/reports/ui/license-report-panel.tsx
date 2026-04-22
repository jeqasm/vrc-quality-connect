import { useQuery } from '@tanstack/react-query';
import { RefObject, useRef, useState } from 'react';

import { getLicenseReport } from '../api/license-reports-api';
import { LicenseReport, LicenseTrendPoint, LicenseTypeSummary } from '../model/license-report';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { exportHtmlElementToPdf } from '../lib/report-pdf-export';

const reportPalette = ['#0f766e', '#2563eb', '#d97706', '#be185d', '#7c3aed', '#0891b2'];

type LicenseReportPanelProps = {
  dateRange: DateRangeValue;
  reportData?: LicenseReport;
  showExportAction?: boolean;
};

export function LicenseReportPanel(props: LicenseReportPanelProps) {
  const [activeLicenseType, setActiveLicenseType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement | null>(null);

  const licenseReportQuery = useQuery({
    queryKey: ['license-report', props.dateRange],
    queryFn: () => getLicenseReport(props.dateRange),
    enabled: props.reportData === undefined,
  });

  const report = props.reportData ?? licenseReportQuery.data;
  const showExportAction = props.showExportAction ?? true;

  if (!report && licenseReportQuery.isLoading) {
    return <div className="muted-text">Loading reports...</div>;
  }

  if (!report && (licenseReportQuery.isError || !licenseReportQuery.data)) {
    return (
      <ErrorBlock
        title="Failed to load license report"
        message="License report metrics are unavailable right now."
        onRetry={() => {
          void licenseReportQuery.refetch();
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
          <h2 className="collapsible-title">Отчет по лицензиям</h2>
          <p className="collapsible-subtitle">
            Аналитика строится по сохраненным данным реестра и поддерживает любой диапазон дат.
          </p>
        </div>
        {showExportAction ? (
          <div className="reports-toolbar-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={isExporting}
              onClick={() => void exportReportToPdf(exportContainerRef, props.dateRange, setIsExporting)}
            >
              {exportLabel}
            </button>
          </div>
        ) : null}
      </div>

      <div className="report-export-sheet" ref={exportContainerRef}>
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>Отчет по лицензиям</h2>
          </div>
          <div className="report-export-meta">
            <div className="pill">Период: {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}</div>
            <div className="pill pill-neutral">Всего выдано: {report.totalIssuedLicenses}</div>
          </div>
        </section>

        <section className="reports-grid">
          <div className="content-card report-chart-card">
            <div className="section-heading">
              <h2>Распределение по типам</h2>
            </div>
            <LicenseDonutChart
              items={report.licenseTypes}
              activeLicenseType={activeLicenseType}
              onActiveLicenseTypeChange={setActiveLicenseType}
            />
          </div>

          <div className="accent-card report-breakdown-card">
            <div className="section-heading">
              <h2>Структура выдачи</h2>
            </div>
            <div className="list">
              {report.licenseTypes.map((item, index) => (
                <div
                  className={`list-item report-type-row${activeLicenseType === item.licenseType ? ' report-type-row-active' : ''}`}
                  key={item.licenseType}
                  onMouseEnter={() => setActiveLicenseType(item.licenseType)}
                  onMouseLeave={() => setActiveLicenseType(null)}
                >
                  <div className="report-type-head">
                    <span
                      className="report-color-chip"
                      style={{ backgroundColor: reportPalette[index % reportPalette.length] }}
                    />
                    <strong>{item.licenseType}</strong>
                  </div>
                  <div className="table-secondary">
                    {item.quantity} лицензий, {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-card report-chart-card">
          <div className="section-heading">
            <h2>Динамика выдачи по датам</h2>
          </div>
          <LicenseTrendChart points={report.issueTrend} />
        </section>
      </div>
    </div>
  );
}

async function exportReportToPdf(
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
    await exportHtmlElementToPdf(exportNode, `license-report-${dateRange.dateFrom}_to_${dateRange.dateTo}.pdf`);
  } finally {
    setIsExporting(false);
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

function LicenseDonutChart({
  items,
  activeLicenseType,
  onActiveLicenseTypeChange,
}: {
  items: LicenseTypeSummary[];
  activeLicenseType: string | null;
  onActiveLicenseTypeChange: (licenseType: string | null) => void;
}) {
  if (items.length === 0) {
    return <div className="muted-text">Нет данных для построения диаграммы.</div>;
  }

  const radius = 76;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="report-donut-layout">
      <svg viewBox="0 0 220 220" className="report-donut-chart" aria-label="License type distribution">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="rgba(143, 165, 189, 0.18)"
          strokeWidth={strokeWidth}
        />
        {items.map((item, index) => {
          const segmentLength = (item.percentage / 100) * circumference;
          const isActive = activeLicenseType === item.licenseType;
          const hasActiveSelection = activeLicenseType !== null;
          const circle = (
            <circle
              key={item.licenseType}
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={reportPalette[index % reportPalette.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-cumulativeOffset}
              strokeLinecap="butt"
              transform="rotate(-90 110 110)"
              className={isActive ? 'report-donut-segment-active' : 'report-donut-segment'}
              style={{
                opacity: hasActiveSelection && !isActive ? 0.28 : 1,
                filter: isActive ? 'drop-shadow(0 0 8px rgba(23, 32, 51, 0.16))' : 'none',
              }}
              onMouseEnter={() => onActiveLicenseTypeChange(item.licenseType)}
              onMouseLeave={() => onActiveLicenseTypeChange(null)}
            />
          );
          cumulativeOffset += segmentLength;
          return circle;
        })}
        <text x="110" y="102" textAnchor="middle" className="report-donut-total-label">
          Total
        </text>
        <text x="110" y="126" textAnchor="middle" className="report-donut-total-value">
          {items.reduce((sum, item) => sum + item.quantity, 0)}
        </text>
      </svg>

      <div className="report-donut-export" aria-hidden="true">
        <ExportDonutChart
          totalLabel="Total"
          totalValue={`${items.reduce((sum, item) => sum + item.quantity, 0)}`}
          segments={items.map((item, index) => ({
            value: item.percentage,
            color: reportPalette[index % reportPalette.length],
          }))}
        />
      </div>
    </div>
  );
}

function ExportDonutChart(props: {
  totalLabel: string;
  totalValue: string;
  segments: Array<{ value: number; color: string }>;
}) {
  const outerRadius = 92;
  const innerRadius = 58;
  const center = 110;
  let currentAngle = -90;

  return (
    <div className="report-donut-export-chart">
      <svg viewBox="0 0 220 220" className="report-donut-export-chart-svg" aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="rgba(143, 165, 189, 0.18)"
          strokeWidth={outerRadius - innerRadius}
        />
        {props.segments.map((segment, index) => {
          const safeValue = Math.max(0, Math.min(100, segment.value));
          if (safeValue <= 0) {
            return null;
          }

          const startAngle = currentAngle;
          const endAngle = currentAngle + (safeValue / 100) * 360;
          currentAngle = endAngle;

          return (
            <path
              key={`export-donut-segment-${index}`}
              d={buildDonutSegmentPath(center, center, outerRadius, innerRadius, startAngle, endAngle)}
              fill={segment.color}
            />
          );
        })}
        <circle cx={center} cy={center} r={innerRadius} fill="#f5f9fc" />
        <text x={center} y={center - 8} textAnchor="middle" className="report-donut-export-label">
          {props.totalLabel}
        </text>
        <text x={center} y={center + 14} textAnchor="middle" className="report-donut-export-value">
          {props.totalValue}
        </text>
      </svg>
    </div>
  );
}

function buildDonutSegmentPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const normalizedStart = startAngle;
  let normalizedEnd = endAngle;
  if (normalizedEnd - normalizedStart >= 360) {
    normalizedEnd = normalizedStart + 359.999;
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, normalizedStart);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, normalizedEnd);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, normalizedEnd);
  const innerStart = polarToCartesian(cx, cy, innerRadius, normalizedStart);
  const largeArcFlag = normalizedEnd - normalizedStart > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const radians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function LicenseTrendChart({ points }: { points: LicenseTrendPoint[] }) {
  if (points.length === 0) {
    return <div className="muted-text">Нет данных для построения графика.</div>;
  }

  const width = 900;
  const height = 280;
  const padding = { top: 24, right: 24, bottom: 48, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxQuantity = Math.max(...points.map((point) => point.quantity), 1);

  const chartPoints = points.map((point, index) => {
    const x =
      points.length === 1 ? padding.left + innerWidth / 2 : padding.left + (index / (points.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (point.quantity / maxQuantity) * innerHeight;
    return {
      ...point,
      x,
      y,
    };
  });

  const path = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="report-trend-layout">
      <svg viewBox={`0 0 ${width} ${height}`} className="report-trend-chart" aria-label="License issue trend">
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          stroke="rgba(96, 122, 152, 0.35)"
          strokeWidth="1.5"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="rgba(96, 122, 152, 0.35)"
          strokeWidth="1.5"
        />

        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const value = Math.round(maxQuantity * step);
          const y = padding.top + innerHeight - step * innerHeight;
          return (
            <g key={step}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="rgba(143, 165, 189, 0.18)"
                strokeWidth="1"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#61738b" fontSize="12">
                {value}
              </text>
            </g>
          );
        })}

        <path
          d={path}
          fill="none"
          stroke="#0f766e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {chartPoints.map((point) => (
          <g key={point.issueDate}>
            <text x={point.x} y={point.y - 14} textAnchor="middle" fill="#172033" fontSize="12" fontWeight="700">
              {point.quantity}
            </text>
            <circle cx={point.x} cy={point.y} r="5" fill="#0f766e" stroke="#ffffff" strokeWidth="3" />
            <text x={point.x} y={height - 18} textAnchor="middle" fill="#61738b" fontSize="12">
              {new Date(`${point.issueDate}T00:00:00`).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
              })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
