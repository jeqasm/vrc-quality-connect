import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getReportZone, ReportZoneKey } from '../../../modules/reports/model/report-zone';
import { QaWeeklyReportPanel } from '../../../modules/reports/ui/qa-weekly-report-panel';
import { LicenseReportPanel } from '../../../modules/reports/ui/license-report-panel';
import { DateRangeValue, getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

const reportTabs: ReportZoneKey[] = ['qa', 'licenses', 'support', 'management'];
const currentWeekDateRange = getCurrentWeekDateRange();

function isReportZoneKey(value: string | null): value is ReportZoneKey {
  return value !== null && reportTabs.includes(value as ReportZoneKey);
}

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneFromSearch = searchParams.get('tab');
  const zoneKey: ReportZoneKey = isReportZoneKey(zoneFromSearch) ? zoneFromSearch : reportTabs[0];
  const zone = getReportZone(zoneKey);
  const [workspaceDateRange, setWorkspaceDateRange] = useState<DateRangeValue>(currentWeekDateRange);
  const [tabDateRanges, setTabDateRanges] = useState<Record<ReportZoneKey, DateRangeValue>>({
    qa: currentWeekDateRange,
    licenses: currentWeekDateRange,
    support: currentWeekDateRange,
    management: currentWeekDateRange,
  });

  const activeTabDateRange = tabDateRanges[zoneKey];

  function handleZoneChange(nextZoneKey: ReportZoneKey) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', nextZoneKey);
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handleTabDateRangeChange(nextValue: DateRangeValue) {
    setTabDateRanges((current) => ({
      ...current,
      [zoneKey]: nextValue,
    }));
  }

  return (
    <div className="page-grid reports-page">
      <TopBar
        title="Reports workspace"
        subtitle={zone.subtitle}
        dateRange={
          <div className="reports-workspace-range-shell">
            <div className="reports-workspace-range-label">Общий период отчетов</div>
            <DateRangePicker
              value={workspaceDateRange}
              onChange={setWorkspaceDateRange}
            />
          </div>
        }
      />

      <section className="zone-tabs-shell" aria-label="Reports zones">
        <div className="zone-tabs">
          {reportTabs.map((item) => {
            const itemZone = getReportZone(item);
            const isActive = zoneKey === item;

            return (
              <button
                key={item}
                type="button"
                className={`zone-tab${isActive ? ' zone-tab-active' : ''}`}
                onClick={() => handleZoneChange(item)}
              >
                <span className="zone-tab-title">{itemZone.title}</span>
                <span className="zone-tab-subtitle">{itemZone.subtitle}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="content-card">
          <DateRangePicker
            variant="panel"
            value={activeTabDateRange}
            onChange={handleTabDateRangeChange}
          />
        </div>
      </section>

      <section>
        <div className="content-card">
          {zoneKey === 'licenses' ? (
            <LicenseReportPanel dateRange={activeTabDateRange} />
          ) : zoneKey === 'qa' ? (
            <QaWeeklyReportPanel dateRange={activeTabDateRange} />
          ) : (
            <EmptyState
              title={`${zone.title} report will be added next`}
              message="Для этого направления вкладка уже подготовлена, но детальная отчетность будет добавлена следующим этапом."
            />
          )}
        </div>
      </section>
    </div>
  );
}
