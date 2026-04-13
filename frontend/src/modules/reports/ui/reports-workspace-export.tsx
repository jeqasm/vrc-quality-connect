import { RefObject } from 'react';

import { LicenseReportPanel } from './license-report-panel';
import { ManagementWeeklyReportPanel } from './management-weekly-report-panel';
import { QaWeeklyReportPanel } from './qa-weekly-report-panel';
import { SupportWeeklyReportPanel } from './support-weekly-report-panel';
import { LicenseReport } from '../model/license-report';
import { ManagementWeeklyReportSummary } from '../model/management-weekly-report';
import { QaWeeklyReportSummary } from '../model/qa-weekly-report';
import { SupportWeeklyReportSummary } from '../model/support-weekly-report';
import { DateRangeValue } from '../../../shared/lib/date-range';

export type ReportsExportBundle = {
  licenseReport: LicenseReport;
  qaReport: QaWeeklyReportSummary;
  supportReport: SupportWeeklyReportSummary;
  managementReport: ManagementWeeklyReportSummary;
};

type ReportsWorkspaceExportProps = {
  dateRange: DateRangeValue;
  bundle: ReportsExportBundle;
  sectionRefs: {
    licenseSectionRef: RefObject<HTMLDivElement | null>;
    qaSectionRef: RefObject<HTMLDivElement | null>;
    supportSectionRef: RefObject<HTMLDivElement | null>;
    managementSectionRef: RefObject<HTMLDivElement | null>;
    summarySectionRef: RefObject<HTMLDivElement | null>;
  };
};

type DepartmentHoursSummary = {
  departmentCode: 'licenses' | 'qa' | 'support' | 'management';
  departmentName: string;
  totalHours: number;
  employees: Array<{
    userId: string;
    userFullName: string;
    totalHours: number;
  }>;
};

export function ReportsWorkspaceExport(props: ReportsWorkspaceExportProps) {
  const hoursSummary = buildDepartmentHoursSummary(props.bundle);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: '-10000px',
        width: '1200px',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <div ref={props.sectionRefs.licenseSectionRef}>
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>Сводный экспорт отчетов</h2>
          </div>
          <div className="report-export-meta">
            <div className="pill">
              Период: {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}
            </div>
            <div className="pill pill-neutral">Порядок: Licenses → QA → Technical Support → Management</div>
          </div>
        </section>
        <LicenseReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.licenseReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.qaSectionRef}>
        <QaWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.qaReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.supportSectionRef}>
        <SupportWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.supportReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.managementSectionRef}>
        <ManagementWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.managementReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.summarySectionRef} className="page-grid">
        <section className="content-card report-export-header">
          <div className="section-heading">
            <h2>Итоговая сводка по часам</h2>
          </div>
          <div className="report-export-meta">
            <div className="pill">
              Период: {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <h2>Часы по отделам</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Отдел</th>
                  <th>Часы</th>
                </tr>
              </thead>
              <tbody>
                {hoursSummary.map((department) => (
                  <tr key={department.departmentCode}>
                    <td>{department.departmentName}</td>
                    <td>{formatHours(department.totalHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {hoursSummary.map((department) => (
          <section className="content-card" key={`employees-${department.departmentCode}`}>
            <div className="qa-report-section-head">
              <div className="section-heading">
                <h2>{department.departmentName}</h2>
              </div>
              <div className="qa-report-summary-strip">
                <SummaryInlineStat label="Всего часов" value={formatHours(department.totalHours)} />
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th>Часы</th>
                  </tr>
                </thead>
                <tbody>
                  {department.employees.length > 0 ? (
                    department.employees.map((employee) => (
                      <tr key={`${department.departmentCode}-${employee.userId}`}>
                        <td>{employee.userFullName}</td>
                        <td>{formatHours(employee.totalHours)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>Нет часовых записей за период.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function buildDepartmentHoursSummary(bundle: ReportsExportBundle): DepartmentHoursSummary[] {
  return [
    {
      departmentCode: 'licenses',
      departmentName: 'Licenses',
      totalHours: 0,
      employees: [],
    },
    {
      departmentCode: 'qa',
      departmentName: 'QA',
      totalHours: bundle.qaReport.totals.totalOtherTaskHours,
      employees: buildEmployeeHours(
        bundle.qaReport.otherTasks.map((item) => ({
          userId: item.userId,
          userFullName: item.userFullName,
          durationMinutes: item.durationMinutes,
        })),
      ),
    },
    {
      departmentCode: 'support',
      departmentName: 'Technical Support',
      totalHours: bundle.supportReport.totals.totalCategoryHours,
      employees: buildEmployeeHours(
        bundle.supportReport.categoryItems.map((item) => ({
          userId: item.userId,
          userFullName: item.userFullName,
          durationMinutes: item.durationMinutes,
        })),
      ),
    },
    {
      departmentCode: 'management',
      departmentName: 'Management',
      totalHours: bundle.managementReport.totals.totalCategoryHours,
      employees: buildEmployeeHours(
        bundle.managementReport.categoryItems.map((item) => ({
          userId: item.userId,
          userFullName: item.userFullName,
          durationMinutes: item.durationMinutes,
        })),
      ),
    },
  ];
}

function buildEmployeeHours(
  items: Array<{ userId: string; userFullName: string; durationMinutes: number }>,
) {
  const employeesById = new Map<
    string,
    { userId: string; userFullName: string; totalMinutes: number }
  >();

  items.forEach((item) => {
    const existingEmployee = employeesById.get(item.userId);

    if (existingEmployee) {
      existingEmployee.totalMinutes += item.durationMinutes;
      return;
    }

    employeesById.set(item.userId, {
      userId: item.userId,
      userFullName: item.userFullName,
      totalMinutes: item.durationMinutes,
    });
  });

  return Array.from(employeesById.values())
    .map((employee) => ({
      userId: employee.userId,
      userFullName: employee.userFullName,
      totalHours: toHours(employee.totalMinutes),
    }))
    .sort((left, right) => right.totalHours - left.totalHours || left.userFullName.localeCompare(right.userFullName));
}

function SummaryInlineStat(props: { label: string; value: string }) {
  return (
    <div className="qa-report-inline-stat">
      <span className="qa-report-inline-label">{props.label}</span>
      <span className="qa-report-inline-value">{props.value}</span>
    </div>
  );
}

function toHours(durationMinutes: number) {
  return Math.round((durationMinutes / 60) * 100) / 100;
}

function formatHours(value: number) {
  return `${Math.round(value * 100) / 100}`;
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
