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
    coverSectionRef: RefObject<HTMLDivElement | null>;
    licenseSectionRef: RefObject<HTMLDivElement | null>;
    qaSectionRef: RefObject<HTMLDivElement | null>;
    supportSectionRef: RefObject<HTMLDivElement | null>;
    managementSectionRef: RefObject<HTMLDivElement | null>;
    summarySectionRef: RefObject<HTMLDivElement | null>;
  };
};

type DepartmentHoursSummary = {
  departmentCode: 'qa' | 'support' | 'management';
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
      <div ref={props.sectionRefs.coverSectionRef}>
        <section className="report-cover-sheet">
          <div className="report-cover-top">
            <div className="report-cover-brand">
              <div className="report-cover-brand-mark">VRC</div>
              <div className="report-cover-brand-copy">
                <div className="report-cover-brand-title">Quality Connect</div>
                <div className="report-cover-brand-subtitle">Operations reporting package</div>
              </div>
            </div>
            <div className="report-cover-top-line" />
          </div>

          <div className="report-cover-body">
            <div className="report-cover-kicker">Weekly reporting export</div>
            <h1 className="report-cover-title">Сводный пакет отчетов</h1>
            <p className="report-cover-description">
              Консолидированный экспорт операционных данных по направлениям Licenses, QA, Technical Support и
              Management.
            </p>

            <div className="report-cover-meta-grid">
              <div className="report-cover-meta-card">
                <span className="report-cover-meta-label">Период</span>
                <strong className="report-cover-meta-value">
                  {formatDateRange(props.dateRange.dateFrom, props.dateRange.dateTo)}
                </strong>
              </div>
            </div>

            <div className="report-cover-section-list">
              <div className="report-cover-section-item">
                <span className="report-cover-section-index">01</span>
                <div>
                  <div className="report-cover-section-title">Licenses</div>
                  <div className="report-cover-section-text">Сводка выдачи, распределение по типам и динамика по датам</div>
                </div>
              </div>
              <div className="report-cover-section-item">
                <span className="report-cover-section-index">02</span>
                <div>
                  <div className="report-cover-section-title">QA</div>
                  <div className="report-cover-section-text">Баги, задачи, ретест и аналитика по критичности</div>
                </div>
              </div>
              <div className="report-cover-section-item">
                <span className="report-cover-section-index">03</span>
                <div>
                  <div className="report-cover-section-title">Technical Support</div>
                  <div className="report-cover-section-text">Проектная работа, категории поддержки и трудозатраты</div>
                </div>
              </div>
              <div className="report-cover-section-item">
                <span className="report-cover-section-index">04</span>
                <div>
                  <div className="report-cover-section-title">Management</div>
                  <div className="report-cover-section-text">Проекты, управленческие категории и распределение часов</div>
                </div>
              </div>
              <div className="report-cover-section-item">
                <span className="report-cover-section-index">05</span>
                <div>
                  <div className="report-cover-section-title">Summary</div>
                  <div className="report-cover-section-text">Итоговая сводка часов по отделам и сотрудникам</div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-cover-footer">
            <div className="report-cover-watermark">REPORTS</div>
          </div>
        </section>
      </div>

      <div ref={props.sectionRefs.licenseSectionRef}>
        <ExportSectionHeading
          sectionCode="01"
          title="Licenses"
          subtitle="Отчет по лицензиям"
        />
        <LicenseReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.licenseReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.qaSectionRef}>
        <ExportSectionHeading
          sectionCode="02"
          title="QA"
          subtitle="QA weekly report"
        />
        <QaWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.qaReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.supportSectionRef}>
        <ExportSectionHeading
          sectionCode="03"
          title="Technical Support"
          subtitle="Support weekly report"
        />
        <SupportWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.supportReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.managementSectionRef}>
        <ExportSectionHeading
          sectionCode="04"
          title="Management"
          subtitle="Management weekly report"
        />
        <ManagementWeeklyReportPanel
          dateRange={props.dateRange}
          reportData={props.bundle.managementReport}
          showExportAction={false}
        />
      </div>

      <div ref={props.sectionRefs.summarySectionRef} className="page-grid">
        <ExportSectionHeading
          sectionCode="05"
          title="Summary"
          subtitle="Итоговая сводка"
        />
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

function ExportSectionHeading(props: { sectionCode: string; title: string; subtitle: string }) {
  return (
    <section className="report-export-section-heading">
      <div className="report-export-section-code">{props.sectionCode}</div>
      <div className="report-export-section-copy">
        <h1 className="report-export-section-title">{props.title}</h1>
        <p className="report-export-section-subtitle">{props.subtitle}</p>
      </div>
    </section>
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
