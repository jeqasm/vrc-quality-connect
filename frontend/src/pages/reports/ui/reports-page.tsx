import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { hasPermission } from '../../../modules/access/model/access-check';
import { accessPermissions } from '../../../modules/access/model/access-permissions';
import { useAuth } from '../../../modules/auth/providers/auth-provider';
import { getLicenseReport } from '../../../modules/reports/api/license-reports-api';
import { getManagementWeeklyReportSummary } from '../../../modules/reports/api/management-weekly-reports-api';
import { getQaWeeklyReportSummary } from '../../../modules/reports/api/qa-weekly-reports-api';
import { getSupportWeeklyReportSummary } from '../../../modules/reports/api/support-weekly-reports-api';
import { getReportZone, ReportZoneKey } from '../../../modules/reports/model/report-zone';
import { QaWeeklyReportPanel } from '../../../modules/reports/ui/qa-weekly-report-panel';
import { LicenseReportPanel } from '../../../modules/reports/ui/license-report-panel';
import { ManagementWeeklyReportPanel } from '../../../modules/reports/ui/management-weekly-report-panel';
import { exportHtmlSectionsToPdf } from '../../../modules/reports/lib/report-pdf-export';
import { ReportsExportBundle, ReportsWorkspaceExport } from '../../../modules/reports/ui/reports-workspace-export';
import { SupportWeeklyReportPanel } from '../../../modules/reports/ui/support-weekly-report-panel';
import { DateRangeValue, getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

const currentWeekDateRange = getCurrentWeekDateRange();

export function ReportsPage() {
  const auth = useAuth();
  const reportTabs: ReportZoneKey[] = [
    hasPermission(auth.account?.permissions ?? [], accessPermissions.reportsQaView) ? 'qa' : null,
    hasPermission(auth.account?.permissions ?? [], accessPermissions.reportsLicensesView)
      ? 'licenses'
      : null,
    hasPermission(auth.account?.permissions ?? [], accessPermissions.reportsSupportView)
      ? 'support'
      : null,
    hasPermission(auth.account?.permissions ?? [], accessPermissions.reportsManagementView)
      ? 'management'
      : null,
  ].filter(Boolean) as ReportZoneKey[];
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneFromSearch = searchParams.get('tab');
  if (reportTabs.length === 0) {
    return (
      <div className="page-grid">
        <EmptyState
          title="No report tabs available"
          message="Для текущего аккаунта доступ к вкладкам отчетности пока не назначен."
        />
      </div>
    );
  }

  const zoneKey: ReportZoneKey =
    zoneFromSearch !== null && reportTabs.includes(zoneFromSearch as ReportZoneKey)
      ? (zoneFromSearch as ReportZoneKey)
      : reportTabs[0];
  const zone = getReportZone(zoneKey);
  const [workspaceDateRange, setWorkspaceDateRange] = useState<DateRangeValue>(currentWeekDateRange);
  const activeTabDateRange = workspaceDateRange;
  const [isExportingAllReports, setIsExportingAllReports] = useState(false);
  const [exportBundle, setExportBundle] = useState<ReportsExportBundle | null>(null);
  const licenseSectionRef = useRef<HTMLDivElement | null>(null);
  const qaSectionRef = useRef<HTMLDivElement | null>(null);
  const supportSectionRef = useRef<HTMLDivElement | null>(null);
  const managementSectionRef = useRef<HTMLDivElement | null>(null);
  const summarySectionRef = useRef<HTMLDivElement | null>(null);

  function handleZoneChange(nextZoneKey: ReportZoneKey) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', nextZoneKey);
    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleExportAllReports() {
    setIsExportingAllReports(true);

    try {
      const [
        licenseReport,
        qaReport,
        supportReport,
        managementReport,
      ] = await Promise.all([
        getLicenseReport(workspaceDateRange),
        getQaWeeklyReportSummary(workspaceDateRange),
        getSupportWeeklyReportSummary(workspaceDateRange),
        getManagementWeeklyReportSummary(workspaceDateRange),
      ]);

      setExportBundle({
        licenseReport,
        qaReport,
        supportReport,
        managementReport,
      });

      await waitForNextRenderCycle();

      await exportHtmlSectionsToPdf(
        [
          licenseSectionRef.current,
          qaSectionRef.current,
          supportSectionRef.current,
          managementSectionRef.current,
          summarySectionRef.current,
        ],
        `reports-workspace-${workspaceDateRange.dateFrom}_to_${workspaceDateRange.dateTo}.pdf`,
      );
    } finally {
      setIsExportingAllReports(false);
    }
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
        action={
          <Button
            type="button"
            variant="secondary"
            disabled={isExportingAllReports}
            onClick={() => void handleExportAllReports()}
          >
            {isExportingAllReports ? 'Экспорт всех отчетов...' : 'Экспорт всех отчетов'}
          </Button>
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
            onChange={setWorkspaceDateRange}
          />
        </div>
      </section>

      <section>
        <div className="content-card">
          {zoneKey === 'licenses' ? (
            <LicenseReportPanel dateRange={activeTabDateRange} />
          ) : zoneKey === 'qa' ? (
            <QaWeeklyReportPanel dateRange={activeTabDateRange} />
          ) : zoneKey === 'support' ? (
            <SupportWeeklyReportPanel dateRange={activeTabDateRange} />
          ) : zoneKey === 'management' ? (
            <ManagementWeeklyReportPanel dateRange={activeTabDateRange} />
          ) : (
            <EmptyState
              title={`${zone.title} report will be added next`}
              message="Для этого направления вкладка уже подготовлена, но детальная отчетность будет добавлена следующим этапом."
            />
          )}
        </div>
      </section>

      {exportBundle ? (
        <ReportsWorkspaceExport
          dateRange={workspaceDateRange}
          bundle={exportBundle}
          sectionRefs={{
            licenseSectionRef,
            qaSectionRef,
            supportSectionRef,
            managementSectionRef,
            summarySectionRef,
          }}
        />
      ) : null}
    </div>
  );
}

async function waitForNextRenderCycle() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}
