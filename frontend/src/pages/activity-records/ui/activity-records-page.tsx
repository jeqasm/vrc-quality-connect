import { useMutation, useQuery } from '@tanstack/react-query';
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ActivityRecordZoneKey,
  getActivityRecordZone,
} from '../../../modules/activity-records/model/activity-record-zone';
import { hasPermission } from '../../../modules/access/model/access-check';
import { accessPermissions } from '../../../modules/access/model/access-permissions';
import { useAuth } from '../../../modules/auth/providers/auth-provider';
import { LicensesRegistryWorkspace } from '../../../modules/licenses/ui/licenses-registry-workspace';
import {
  getQaWeeklyReport,
  saveQaWeeklyReport,
  submitQaWeeklyReport,
} from '../../../modules/qa-weekly-reports/api/qa-weekly-reports-api';
import { ManagementWeeklyReportWorkspace } from '../../../modules/management-weekly-reports/ui/management-weekly-report-workspace';
import { SupportWeeklyReportWorkspace } from '../../../modules/support-weekly-reports/ui/support-weekly-report-workspace';
import { getUsers } from '../../../modules/reference-data/api/reference-data-api';
import { UserOption } from '../../../modules/reference-data/model/reference-data';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Modal } from '../../../shared/ui/modal/modal';
import { Select } from '../../../shared/ui/select/select';
import { getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

type DateRangeState = {
  dateFrom: string;
  dateTo: string;
};

const currentWeekDateRange = getCurrentWeekDateRange();

const initialDateRangeState: DateRangeState = {
  dateFrom: currentWeekDateRange.dateFrom,
  dateTo: currentWeekDateRange.dateTo,
};

const activityZoneTabs: ActivityRecordZoneKey[] = ['qa', 'licenses', 'support', 'management'];
const activityRecordsPageStateStorageKey = 'activity-records-page-state';

function isActivityRecordZoneKey(value: string | null): value is ActivityRecordZoneKey {
  return value !== null && activityZoneTabs.includes(value as ActivityRecordZoneKey);
}

type QaBugFormState = {
  id: string;
  projectName: string;
  bugTitle: string;
  bugUrl: string;
  bugType: string;
  bugStatus: string;
};

type QaLicenseRowState = {
  id: string;
  licenseType: string;
  quantity: string;
  issuedTo: string;
};

type QaOtherTaskRowState = {
  id: string;
  taskName: string;
  shortDescription: string;
  hours: string;
};

type ActivityRecordsPageState = {
  dateRange: DateRangeState;
  sections: {
    retestOpen: boolean;
    newBugsOpen: boolean;
    testedTasksOpen: boolean;
    newTasksOpen: boolean;
    otherTasksOpen: boolean;
    licensesOpen: boolean;
  };
  rows: {
    qaRetestRows: QaBugFormState[];
    qaNewBugRows: QaBugFormState[];
    qaTestedTaskRows: QaBugFormState[];
    qaNewTaskRows: QaBugFormState[];
    qaOtherTaskRows: QaOtherTaskRowState[];
  };
};

function createQaBugRow(): QaBugFormState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    projectName: '',
    bugTitle: '',
    bugUrl: '',
    bugType: '',
    bugStatus: '',
  };
}

function createQaLicenseRow(): QaLicenseRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    licenseType: '',
    quantity: '',
    issuedTo: '',
  };
}

function createQaOtherTaskRow(): QaOtherTaskRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    taskName: '',
    shortDescription: '',
    hours: '',
  };
}

function buildDefaultActivityRecordsPageState(): ActivityRecordsPageState {
  return {
    dateRange: initialDateRangeState,
    sections: {
      retestOpen: true,
      newBugsOpen: true,
      testedTasksOpen: true,
      newTasksOpen: true,
      otherTasksOpen: true,
      licensesOpen: true,
    },
    rows: {
      qaRetestRows: [createQaBugRow()],
      qaNewBugRows: [createQaBugRow()],
      qaTestedTaskRows: [createQaBugRow()],
      qaNewTaskRows: [createQaBugRow()],
      qaOtherTaskRows: [createQaOtherTaskRow()],
    },
  };
}

function readStoredActivityRecordsPageState(): ActivityRecordsPageState {
  const defaultState = buildDefaultActivityRecordsPageState();

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const rawState = window.localStorage.getItem(activityRecordsPageStateStorageKey);

    if (!rawState) {
      return defaultState;
    }

    const parsedState = JSON.parse(rawState) as Partial<ActivityRecordsPageState>;

    return {
      dateRange: parsedState.dateRange ?? defaultState.dateRange,
      sections: {
        ...defaultState.sections,
        ...parsedState.sections,
      },
      rows: {
        qaRetestRows: parsedState.rows?.qaRetestRows?.length
          ? parsedState.rows.qaRetestRows
          : defaultState.rows.qaRetestRows,
        qaNewBugRows: parsedState.rows?.qaNewBugRows?.length
          ? parsedState.rows.qaNewBugRows
          : defaultState.rows.qaNewBugRows,
        qaTestedTaskRows: parsedState.rows?.qaTestedTaskRows?.length
          ? parsedState.rows.qaTestedTaskRows
          : defaultState.rows.qaTestedTaskRows,
        qaNewTaskRows: parsedState.rows?.qaNewTaskRows?.length
          ? parsedState.rows.qaNewTaskRows
          : defaultState.rows.qaNewTaskRows,
        qaOtherTaskRows: parsedState.rows?.qaOtherTaskRows?.length
          ? parsedState.rows.qaOtherTaskRows
          : defaultState.rows.qaOtherTaskRows,
      },
    };
  } catch {
    return defaultState;
  }
}

function hasLicenseDraft(rows: QaLicenseRowState[]): boolean {
  return rows.some((row) => row.licenseType || row.quantity || row.issuedTo);
}

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
}

function toDurationMinutes(hours: string): number {
  const normalizedHours = hours.replace(',', '.');
  const value = Number(normalizedHours);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 60);
}

function toHoursString(durationMinutes: number): string {
  return `${Math.round((durationMinutes / 60) * 100) / 100}`;
}

function sanitizeHoursInput(value: string): string {
  const normalizedValue = value.replace('.', ',');

  let nextValue = '';
  let hasComma = false;

  for (const character of normalizedValue) {
    if (character >= '0' && character <= '9') {
      nextValue += character;
      continue;
    }

    if (character === ',' && !hasComma) {
      nextValue += character;
      hasComma = true;
    }
  }

  return nextValue;
}

function getQaUsers(users: UserOption[]): UserOption[] {
  return users.filter((user) => user.department.code === 'qa-testing');
}

function formatQaUserOption(user: UserOption): string {
  return user.fullName;
}

const bugTypeOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const bugStatusOptions = [
  { value: 'resolved', label: 'Решен' },
  { value: 'rework', label: 'На доработке' },
  { value: 'blocked', label: 'Заблокирован' },
];

export function ActivityRecordsPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneFromSearch = searchParams.get('tab');
  const zoneKey: ActivityRecordZoneKey = isActivityRecordZoneKey(zoneFromSearch)
    ? zoneFromSearch
    : 'qa';
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  const [restoredPageState] = useState<ActivityRecordsPageState>(() =>
    readStoredActivityRecordsPageState(),
  );
  const [dateRange, setDateRange] = useState<DateRangeState>(restoredPageState.dateRange);
  const [selectedQaUserId, setSelectedQaUserId] = useState('');
  const [isRetestSectionOpen, setIsRetestSectionOpen] = useState(
    restoredPageState.sections.retestOpen,
  );
  const [isNewBugsSectionOpen, setIsNewBugsSectionOpen] = useState(
    restoredPageState.sections.newBugsOpen,
  );
  const [isTestedTasksSectionOpen, setIsTestedTasksSectionOpen] = useState(
    restoredPageState.sections.testedTasksOpen,
  );
  const [isNewTasksSectionOpen, setIsNewTasksSectionOpen] = useState(
    restoredPageState.sections.newTasksOpen,
  );
  const [isOtherTasksSectionOpen, setIsOtherTasksSectionOpen] = useState(
    restoredPageState.sections.otherTasksOpen,
  );
  const [isLicensesSectionOpen, setIsLicensesSectionOpen] = useState(
    restoredPageState.sections.licensesOpen,
  );
  const [qaRetestRows, setQaRetestRows] = useState<QaBugFormState[]>(
    restoredPageState.rows.qaRetestRows,
  );
  const [qaNewBugRows, setQaNewBugRows] = useState<QaBugFormState[]>(
    restoredPageState.rows.qaNewBugRows,
  );
  const [qaTestedTaskRows, setQaTestedTaskRows] = useState<QaBugFormState[]>(
    restoredPageState.rows.qaTestedTaskRows,
  );
  const [qaNewTaskRows, setQaNewTaskRows] = useState<QaBugFormState[]>(
    restoredPageState.rows.qaNewTaskRows,
  );
  const [qaOtherTaskRows, setQaOtherTaskRows] = useState<QaOtherTaskRowState[]>(
    restoredPageState.rows.qaOtherTaskRows,
  );
  const [qaSaveMessage, setQaSaveMessage] = useState<string | null>(null);
  const [isQaSaveSuccessMessage, setIsQaSaveSuccessMessage] = useState(false);
  const [isQaSubmitConfirmOpen, setIsQaSubmitConfirmOpen] = useState(false);
  const currentUser = auth.account?.user;
  const canManageQaReports = hasPermission(
    auth.account?.permissions ?? [],
    accessPermissions.usersManage,
  );
  const allUsers = usersQuery.data ?? [];
  const currentAccountUser = currentUser
    ? allUsers.find((user) => user.id === currentUser.id) ?? null
    : null;
  const qaUsers = canManageQaReports
    ? allUsers
    : currentAccountUser
      ? [currentAccountUser]
      : getQaUsers(allUsers);

  useEffect(() => {
    if (selectedQaUserId || qaUsers.length === 0) {
      return;
    }

    const preferredUser =
      (currentUser ? qaUsers.find((user) => user.id === currentUser.id) : null) ?? qaUsers[0];
    setSelectedQaUserId(preferredUser.id);
  }, [currentUser, qaUsers, selectedQaUserId]);

  useEffect(() => {
    setQaSaveMessage(null);
    setIsQaSaveSuccessMessage(false);
    setIsQaSubmitConfirmOpen(false);
  }, [selectedQaUserId, dateRange.dateFrom, dateRange.dateTo]);

  const qaWeeklyReportQuery = useQuery({
    queryKey: ['qa-weekly-report', selectedQaUserId, dateRange.dateFrom],
    queryFn: () =>
      getQaWeeklyReport({
        userId: selectedQaUserId,
        weekStart: dateRange.dateFrom,
      }),
    enabled: zoneKey === 'qa' && Boolean(selectedQaUserId),
  });

  const qaSaveMutation = useMutation({
    mutationFn: saveQaWeeklyReport,
    onSuccess: () => {
      setQaSaveMessage('Отчет сохранен как черновик');
      setIsQaSaveSuccessMessage(true);
      void qaWeeklyReportQuery.refetch();
    },
  });

  const qaSubmitMutation = useMutation({
    mutationFn: submitQaWeeklyReport,
    onSuccess: () => {
      setQaSaveMessage('Недельный QA-отчет отправлен.');
      setIsQaSaveSuccessMessage(false);
      void qaWeeklyReportQuery.refetch();
    },
  });

  useEffect(() => {
    const report = qaWeeklyReportQuery.data;

    if (qaWeeklyReportQuery.isFetched && !report) {
      setQaRetestRows([createQaBugRow()]);
      setQaNewBugRows([createQaBugRow()]);
      setQaTestedTaskRows([createQaBugRow()]);
      setQaNewTaskRows([createQaBugRow()]);
      setQaOtherTaskRows([createQaOtherTaskRow()]);
      return;
    }

    if (!report) {
      return;
    }

    const mapBugItems = (bucketCode: string): QaBugFormState[] => {
      const items = report.bugItems.filter((item) => item.bucketCode === bucketCode);

      if (items.length === 0) {
        return [createQaBugRow()];
      }

      return items.map((item) => ({
        id: item.id,
        projectName: item.projectName,
        bugTitle: item.title,
        bugUrl: item.externalUrl ?? '',
        bugType: item.severityCode ?? '',
        bugStatus: item.resultCode ?? '',
      }));
    };

    setQaRetestRows(mapBugItems('retest'));
    setQaNewBugRows(mapBugItems('new_bug'));
    setQaTestedTaskRows(mapBugItems('tested_task'));
    setQaNewTaskRows(mapBugItems('new_task'));
    setQaOtherTaskRows(
      report.otherTaskItems.length > 0
        ? report.otherTaskItems.map((item) => ({
            id: item.id,
            taskName: item.taskName,
            shortDescription: item.description ?? '',
            hours: toHoursString(item.durationMinutes),
          }))
        : [createQaOtherTaskRow()],
    );
  }, [qaWeeklyReportQuery.data, qaWeeklyReportQuery.isFetched]);

  const zone = getActivityRecordZone(zoneKey);

  function handleZoneChange(nextZoneKey: ActivityRecordZoneKey) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', nextZoneKey);
    setSearchParams(nextSearchParams, { replace: true });
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextPageState: ActivityRecordsPageState = {
      dateRange,
      sections: {
        retestOpen: isRetestSectionOpen,
        newBugsOpen: isNewBugsSectionOpen,
        testedTasksOpen: isTestedTasksSectionOpen,
        newTasksOpen: isNewTasksSectionOpen,
        otherTasksOpen: isOtherTasksSectionOpen,
        licensesOpen: isLicensesSectionOpen,
      },
      rows: {
        qaRetestRows,
        qaNewBugRows,
        qaTestedTaskRows,
        qaNewTaskRows,
        qaOtherTaskRows,
      },
    };

    window.localStorage.setItem(
      activityRecordsPageStateStorageKey,
      JSON.stringify(nextPageState),
    );
  }, [
    dateRange,
    isRetestSectionOpen,
    isNewBugsSectionOpen,
    isTestedTasksSectionOpen,
    isNewTasksSectionOpen,
    isOtherTasksSectionOpen,
    isLicensesSectionOpen,
    qaRetestRows,
    qaNewBugRows,
    qaTestedTaskRows,
    qaNewTaskRows,
    qaOtherTaskRows,
  ]);

  function updateQaBugField(
    rowsSetter: Dispatch<SetStateAction<QaBugFormState[]>>,
    rowId: string,
    name: keyof Omit<QaBugFormState, 'id'>,
    value: string,
  ) {
    rowsSetter((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  }

  function addQaBugRow(rowsSetter: Dispatch<SetStateAction<QaBugFormState[]>>) {
    rowsSetter((current) => [...current, createQaBugRow()]);
  }

  function removeQaBugRow(
    rowsSetter: Dispatch<SetStateAction<QaBugFormState[]>>,
    rowId: string,
  ) {
    rowsSetter((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((row) => row.id !== rowId);
    });
  }

  function updateQaOtherTaskField(
    rowId: string,
    name: keyof Omit<QaOtherTaskRowState, 'id'>,
    value: string,
  ) {
    setQaOtherTaskRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [name]: name === 'hours' ? sanitizeHoursInput(value) : value,
            }
          : row,
      ),
    );
  }

  function addQaOtherTaskRow() {
    setQaOtherTaskRows((current) => [...current, createQaOtherTaskRow()]);
  }

  function removeQaOtherTaskRow(rowId: string) {
    setQaOtherTaskRows((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((row) => row.id !== rowId);
    });
  }

  async function handleSaveQaWeeklyReport() {
    if (!selectedQaUserId) {
      setQaSaveMessage('Выберите QA-сотрудника.');
      return;
    }

    const selectedUser = qaUsers.find((user) => user.id === selectedQaUserId);

    if (!selectedUser) {
      setQaSaveMessage('Не удалось определить отдел выбранного сотрудника.');
      return;
    }

    setQaSaveMessage(null);
    setIsQaSaveSuccessMessage(false);

    await qaSaveMutation.mutateAsync({
      userId: selectedQaUserId,
      departmentId: selectedUser.department.id,
      weekStart: dateRange.dateFrom,
      weekEnd: dateRange.dateTo,
      bugItems: [
        ...qaRetestRows.map((row) => ({
          bucketCode: 'retest',
          projectName: row.projectName.trim(),
          title: row.bugTitle.trim(),
          externalUrl: row.bugUrl.trim() || undefined,
          severityCode: row.bugType.trim() || undefined,
          resultCode: row.bugStatus.trim() || undefined,
        })),
        ...qaNewBugRows.map((row) => ({
          bucketCode: 'new_bug',
          projectName: row.projectName.trim(),
          title: row.bugTitle.trim(),
          externalUrl: row.bugUrl.trim() || undefined,
          severityCode: row.bugType.trim() || undefined,
          resultCode: row.bugStatus.trim() || undefined,
        })),
        ...qaTestedTaskRows.map((row) => ({
          bucketCode: 'tested_task',
          projectName: row.projectName.trim(),
          title: row.bugTitle.trim(),
          externalUrl: row.bugUrl.trim() || undefined,
          severityCode: undefined,
          resultCode: row.bugStatus.trim() || undefined,
        })),
        ...qaNewTaskRows.map((row) => ({
          bucketCode: 'new_task',
          projectName: row.projectName.trim(),
          title: row.bugTitle.trim(),
          externalUrl: row.bugUrl.trim() || undefined,
          severityCode: undefined,
          resultCode: row.bugStatus.trim() || undefined,
        })),
      ].filter((item) => item.projectName && item.title),
      otherTaskItems: qaOtherTaskRows
        .map((row) => ({
          taskName: row.taskName.trim(),
          description: row.shortDescription.trim() || undefined,
          durationMinutes: toDurationMinutes(row.hours),
        }))
        .filter((item) => item.taskName),
    });
  }

  function handleSubmitQaWeeklyReportClick() {
    setQaSaveMessage(null);
    setIsQaSaveSuccessMessage(false);
    setIsQaSubmitConfirmOpen(true);
  }

  async function handleSubmitQaWeeklyReportConfirm() {
    if (!selectedQaUserId) {
      setQaSaveMessage('Выберите QA-сотрудника.');
      setIsQaSaveSuccessMessage(false);
      return;
    }

    const selectedUser = qaUsers.find((user) => user.id === selectedQaUserId);

    if (!selectedUser) {
      setQaSaveMessage('Не удалось определить отдел выбранного сотрудника.');
      setIsQaSaveSuccessMessage(false);
      return;
    }

    setIsQaSubmitConfirmOpen(false);

    let reportId = qaWeeklyReportQuery.data?.id;

    if (!reportId) {
      const savedReport = await qaSaveMutation.mutateAsync({
        userId: selectedQaUserId,
        departmentId: selectedUser.department.id,
        weekStart: dateRange.dateFrom,
        weekEnd: dateRange.dateTo,
        bugItems: [
          ...qaRetestRows.map((row) => ({
            bucketCode: 'retest',
            projectName: row.projectName.trim(),
            title: row.bugTitle.trim(),
            externalUrl: row.bugUrl.trim() || undefined,
            severityCode: row.bugType.trim() || undefined,
            resultCode: row.bugStatus.trim() || undefined,
          })),
          ...qaNewBugRows.map((row) => ({
            bucketCode: 'new_bug',
            projectName: row.projectName.trim(),
            title: row.bugTitle.trim(),
            externalUrl: row.bugUrl.trim() || undefined,
            severityCode: row.bugType.trim() || undefined,
            resultCode: row.bugStatus.trim() || undefined,
          })),
          ...qaTestedTaskRows.map((row) => ({
            bucketCode: 'tested_task',
            projectName: row.projectName.trim(),
            title: row.bugTitle.trim(),
            externalUrl: row.bugUrl.trim() || undefined,
            severityCode: undefined,
            resultCode: row.bugStatus.trim() || undefined,
          })),
          ...qaNewTaskRows.map((row) => ({
            bucketCode: 'new_task',
            projectName: row.projectName.trim(),
            title: row.bugTitle.trim(),
            externalUrl: row.bugUrl.trim() || undefined,
            severityCode: undefined,
            resultCode: row.bugStatus.trim() || undefined,
          })),
        ].filter((item) => item.projectName && item.title),
        otherTaskItems: qaOtherTaskRows
          .map((row) => ({
            taskName: row.taskName.trim(),
            description: row.shortDescription.trim() || undefined,
            durationMinutes: toDurationMinutes(row.hours),
          }))
          .filter((item) => item.taskName),
      });

      reportId = savedReport.id;
    }

    await qaSubmitMutation.mutateAsync(reportId);
  }

  const isQaLocked = qaWeeklyReportQuery.data?.status === 'submitted';
  const isQaBusy =
    qaWeeklyReportQuery.isFetching || qaSaveMutation.isPending || qaSubmitMutation.isPending;

  return (
    <div className="page-grid activity-records-page">
      <TopBar
        title="Activity records workspace"
        subtitle={zone.subtitle}
      />

      <section className="zone-tabs-shell" aria-label="Activity zones">
        <div className="zone-tabs">
          {activityZoneTabs.map((item) => {
            const itemZone = getActivityRecordZone(item);
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

      {zone.key !== 'licenses' ? (
        <section>
          <div className="content-card">
            <DateRangePicker
              variant="panel"
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </section>
      ) : null}

      <section>
        <div className="content-card">
          {zone.key === 'qa' ? (
            <div className="page-grid">
              <div className="reports-toolbar">
                <div className="reports-toolbar-copy">
                  <h2 className="collapsible-title">QA weekly input</h2>
                  <p className="collapsible-subtitle">
                    Текущая неделя: {dateRange.dateFrom} - {dateRange.dateTo}
                  </p>
                </div>
                <div className="reports-toolbar-actions">
                  {qaUsers.length > 0 ? (
                    <div className="qa-topbar-user-filter">
                      <span className="qa-topbar-user-label">Сотрудник</span>
                      <Select
                        className="qa-topbar-user-select"
                        value={selectedQaUserId}
                        onChange={setSelectedQaUserId}
                        disabled={isQaBusy}
                        options={qaUsers.map((user) => ({
                          value: user.id,
                          label: formatQaUserOption(user),
                        }))}
                      />
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleSaveQaWeeklyReport()}
                    disabled={!selectedQaUserId || isQaLocked || isQaBusy}
                  >
                    {qaSaveMutation.isPending ? 'Сохранение...' : 'Сохранить черновик'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmitQaWeeklyReportClick}
                    disabled={isQaLocked || isQaBusy}
                  >
                    {qaSubmitMutation.isPending ? 'Отправка...' : 'Отправить'}
                  </Button>
                </div>
              </div>

              {usersQuery.isError ? (
                <div className="form-inline-notice">
                  Не удалось загрузить список QA-сотрудников: {usersQuery.error.message}
                </div>
              ) : null}

              {qaSaveMutation.isError ? (
                <div className="form-inline-notice">
                  Не удалось сохранить недельный QA-отчет: {qaSaveMutation.error.message}
                </div>
              ) : null}

              {qaSubmitMutation.isError ? (
                <div className="form-inline-notice">
                  Не удалось отправить недельный QA-отчет: {qaSubmitMutation.error.message}
                </div>
              ) : null}

              {qaSaveMessage ? (
                <div
                  className={
                    isQaSaveSuccessMessage
                      ? 'form-inline-notice form-inline-notice-info'
                      : 'form-inline-notice form-inline-notice-neutral'
                  }
                >
                  {qaSaveMessage}
                </div>
              ) : null}

              {isQaLocked ? (
                <div className="form-inline-notice form-inline-notice-warning">
                  Отчет уже отправлен. Для внесения изменений обратитесь к администратору
                </div>
              ) : null}

              <Modal
                isOpen={isQaSubmitConfirmOpen}
                title="Подтвердите отправку отчета"
                description="После отправки дальнейшие изменения будут невозможны. Отправить отчет?"
                onClose={() => {
                  if (qaSubmitMutation.isPending) {
                    return;
                  }

                  setIsQaSubmitConfirmOpen(false);
                }}
              >
                <div className="actions-row">
                  <Button
                    type="button"
                    disabled={isQaBusy}
                    onClick={() => void handleSubmitQaWeeklyReportConfirm()}
                  >
                    {qaSubmitMutation.isPending ? 'Отправка...' : 'Отправить'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isQaBusy}
                    onClick={() => setIsQaSubmitConfirmOpen(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </Modal>

              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsRetestSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Ретест багов</h2>
                    <p className="collapsible-subtitle">
                      Здесь фиксируются баги, которые ретестируются на текущей неделе, и их итоговый статус.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isRetestSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isRetestSectionOpen ? (
                  <div className="collapsible-content">
                    <QaBugRowsTable
                      rows={qaRetestRows}
                      disabled={isQaLocked}
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaRetestRows, rowId, name, value)
                      }
                      onAddRow={() => addQaBugRow(setQaRetestRows)}
                      onRemoveRow={(rowId) => removeQaBugRow(setQaRetestRows, rowId)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsNewBugsSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Новые баги</h2>
                    <p className="collapsible-subtitle">
                      Здесь фиксируются новые баги, найденные на текущей неделе.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isNewBugsSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isNewBugsSectionOpen ? (
                  <div className="collapsible-content">
                    <QaBugRowsTable
                      rows={qaNewBugRows}
                      disabled={isQaLocked}
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaNewBugRows, rowId, name, value)
                      }
                      showStatus={false}
                      onAddRow={() => addQaBugRow(setQaNewBugRows)}
                      onRemoveRow={(rowId) => removeQaBugRow(setQaNewBugRows, rowId)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsTestedTasksSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Протестированные задачи</h2>
                    <p className="collapsible-subtitle">
                      Здесь указываются задачи, которые были протестированы на текущей неделе.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isTestedTasksSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isTestedTasksSectionOpen ? (
                  <div className="collapsible-content">
                    <QaBugRowsTable
                      rows={qaTestedTaskRows}
                      disabled={isQaLocked}
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaTestedTaskRows, rowId, name, value)
                      }
                      showImpact={false}
                      titleLabel="Название задачи"
                      linkLabel="Ссылка на задачу"
                      onAddRow={() => addQaBugRow(setQaTestedTaskRows)}
                      onRemoveRow={(rowId) => removeQaBugRow(setQaTestedTaskRows, rowId)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsNewTasksSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Новые задачи</h2>
                    <p className="collapsible-subtitle">
                      Здесь фиксируются новые задачи, найденные или взятые в работу на текущей неделе.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isNewTasksSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isNewTasksSectionOpen ? (
                  <div className="collapsible-content">
                    <QaBugRowsTable
                      rows={qaNewTaskRows}
                      disabled={isQaLocked}
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaNewTaskRows, rowId, name, value)
                      }
                      showImpact={false}
                      showStatus={false}
                      titleLabel="Название задачи"
                      linkLabel="Ссылка на задачу"
                      onAddRow={() => addQaBugRow(setQaNewTaskRows)}
                      onRemoveRow={(rowId) => removeQaBugRow(setQaNewTaskRows, rowId)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsOtherTasksSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Прочие задачи</h2>
                    <p className="collapsible-subtitle">
                      Здесь указываются прочие задачи QA за неделю, которые не относятся к багам или основным задачам.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isOtherTasksSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isOtherTasksSectionOpen ? (
                  <div className="collapsible-content">
                    <QaOtherTasksTable
                      rows={qaOtherTaskRows}
                      disabled={isQaLocked}
                      onChangeField={updateQaOtherTaskField}
                      onAddRow={addQaOtherTaskRow}
                      onRemoveRow={removeQaOtherTaskRow}
                    />
                  </div>
                ) : null}
              </section>
            </div>
          ) : zone.key === 'licenses' ? (
            <LicensesRegistryWorkspace />
          ) : zone.key === 'support' ? (
            <SupportWeeklyReportWorkspace dateRange={dateRange} />
          ) : zone.key === 'management' ? (
            <ManagementWeeklyReportWorkspace dateRange={dateRange} />
          ) : (
            <EmptyState
              title={`${zone.title} form will be added next`}
              message="Для этой вкладки поля еще не собраны. Сейчас реализуется только QA-раздел."
            />
          )}
        </div>
      </section>
    </div>
  );
}

type QaBugRowsTableProps = {
  rows: QaBugFormState[];
  disabled?: boolean;
  onChangeField: (rowId: string, name: keyof Omit<QaBugFormState, 'id'>, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  showImpact?: boolean;
  showStatus?: boolean;
  titleLabel?: string;
  linkLabel?: string;
};

function QaBugRowsTable(props: QaBugRowsTableProps) {
  const showImpact = props.showImpact ?? true;
  const showStatus = props.showStatus ?? true;
  const titleLabel = props.titleLabel ?? 'Название бага';
  const linkLabel = props.linkLabel ?? 'Ссылка на баг';
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    for (const row of props.rows) {
      resizeTextarea(textareaRefs.current[row.id] ?? null);
    }
  }, [props.rows]);

  function handleTitleInput(event: FormEvent<HTMLTextAreaElement>, rowId: string) {
    const element = event.currentTarget;
    resizeTextarea(element);
    props.onChangeField(rowId, 'bugTitle', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div
          className={
            showImpact
              ? showStatus
                ? 'qa-bugs-row'
                : 'qa-bugs-row qa-bugs-row-no-status'
              : showStatus
                ? 'qa-bugs-row qa-bugs-row-compact'
                : 'qa-bugs-row qa-bugs-row-compact-no-status'
          }
        >
          <div>Проект</div>
          <div>{titleLabel}</div>
          <div>{linkLabel}</div>
          {showImpact ? <div>Влияние</div> : null}
          {showStatus ? <div>Текущий статус</div> : null}
          <div className="qa-bugs-actions-head" aria-hidden="true" />
        </div>

        {props.rows.map((row, index) => (
          <div
            className={
              showImpact
                ? showStatus
                  ? 'qa-bugs-row'
                  : 'qa-bugs-row qa-bugs-row-no-status'
                : showStatus
                  ? 'qa-bugs-row qa-bugs-row-compact'
                  : 'qa-bugs-row qa-bugs-row-compact-no-status'
            }
            key={row.id}
          >
            <input
              className="field-input"
              value={row.projectName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'projectName', event.target.value)}
              placeholder={index === 0 ? 'Например: VRC Portal' : 'Проект'}
            />

            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              ref={(element) => {
                textareaRefs.current[row.id] = element;
              }}
              value={row.bugTitle}
              disabled={props.disabled}
              onInput={(event) => handleTitleInput(event, row.id)}
              placeholder={index === 0 ? `Краткое ${titleLabel.toLowerCase()}` : titleLabel}
            />

            <input
              className="field-input"
              type="url"
              value={row.bugUrl}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'bugUrl', event.target.value)}
              placeholder="https://..."
            />

            {showImpact ? (
              <select
                className="field-select"
                value={row.bugType}
                disabled={props.disabled}
                onChange={(event) => props.onChangeField(row.id, 'bugType', event.target.value)}
              >
                <option value="" disabled hidden={row.bugType !== ''}>
                  Влияние
                </option>
                {bugTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {showStatus ? (
              <select
                className="field-select"
                value={row.bugStatus}
                disabled={props.disabled}
                onChange={(event) => props.onChangeField(row.id, 'bugStatus', event.target.value)}
              >
                <option value="" disabled hidden={row.bugStatus !== ''}>
                  Статус
                </option>
                {bugStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            <div className="qa-bugs-actions">
              <button
                type="button"
                className="qa-bugs-remove"
                onClick={() => props.onRemoveRow(row.id)}
                disabled={props.disabled || props.rows.length === 1}
                aria-label="Удалить строку"
                title="Удалить строку"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="qa-bugs-toolbar">
        <button
          type="button"
          className="qa-add-row-button"
          onClick={props.onAddRow}
          disabled={props.disabled}
        >
          <span className="qa-add-row-icon">+</span>
          <span>Добавить новую строку</span>
        </button>
      </div>
    </>
  );
}

type QaLicensesTableProps = {
  rows: QaLicenseRowState[];
  onChangeField: (
    rowId: string,
    name: keyof Omit<QaLicenseRowState, 'id'>,
    value: string,
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
};

function QaLicensesTable(props: QaLicensesTableProps) {
  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-licenses-head qa-licenses-row">
          <div>Тип лицензии</div>
          <div>Количество</div>
          <div>Кому выдано</div>
          <div className="qa-bugs-actions-head" aria-hidden="true" />
        </div>

        {props.rows.map((row) => (
          <div className="qa-licenses-row" key={row.id}>
            <input
              className="field-input"
              value={row.licenseType}
              onChange={(event) => props.onChangeField(row.id, 'licenseType', event.target.value)}
              placeholder="Тип лицензии"
            />

            <input
              className="field-input"
              type="number"
              min="1"
              value={row.quantity}
              onChange={(event) => props.onChangeField(row.id, 'quantity', event.target.value)}
              placeholder="Количество"
            />

            <input
              className="field-input"
              value={row.issuedTo}
              onChange={(event) => props.onChangeField(row.id, 'issuedTo', event.target.value)}
              placeholder="Кому выдано"
            />

            <div className="qa-bugs-actions">
              <button
                type="button"
                className="qa-bugs-remove"
                onClick={() => props.onRemoveRow(row.id)}
                disabled={props.rows.length === 1}
                aria-label="Удалить строку"
                title="Удалить строку"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="qa-bugs-toolbar">
        <button type="button" className="qa-add-row-button" onClick={props.onAddRow}>
          <span className="qa-add-row-icon">+</span>
          <span>Добавить новую строку</span>
        </button>
      </div>
    </>
  );
}

type QaOtherTasksTableProps = {
  rows: QaOtherTaskRowState[];
  disabled?: boolean;
  onChangeField: (
    rowId: string,
    name: keyof Omit<QaOtherTaskRowState, 'id'>,
    value: string,
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
};

function QaOtherTasksTable(props: QaOtherTasksTableProps) {
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    for (const row of props.rows) {
      resizeTextarea(textareaRefs.current[row.id] ?? null);
    }
  }, [props.rows]);

  function handleDescriptionInput(
    event: FormEvent<HTMLTextAreaElement>,
    rowId: string,
  ) {
    const element = event.currentTarget;
    resizeTextarea(element);
    props.onChangeField(rowId, 'shortDescription', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-bugs-head qa-other-tasks-row">
          <div>Задача</div>
          <div>Краткое описание</div>
          <div>Часы</div>
          <div aria-hidden="true" />
        </div>

        {props.rows.map((row, index) => (
          <div className="qa-other-tasks-row" key={row.id}>
            <input
              className="field-input"
              value={row.taskName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'taskName', event.target.value)}
              placeholder={index === 0 ? 'Название задачи' : 'Задача'}
            />

            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              ref={(element) => {
                textareaRefs.current[row.id] = element;
              }}
              value={row.shortDescription}
              disabled={props.disabled}
              onInput={(event) => handleDescriptionInput(event, row.id)}
              placeholder="Краткое описание"
            />

            <input
              className="field-input"
              type="text"
              inputMode="decimal"
              value={row.hours}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'hours', event.target.value)}
              placeholder="Часы"
            />

            <div className="qa-bugs-actions">
              <button
                type="button"
                className="qa-bugs-remove"
                onClick={() => props.onRemoveRow(row.id)}
                disabled={props.disabled || props.rows.length === 1}
                aria-label="Удалить строку"
                title="Удалить строку"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="qa-bugs-toolbar">
        <button
          type="button"
          className="qa-add-row-button"
          onClick={props.onAddRow}
          disabled={props.disabled}
        >
          <span className="qa-add-row-icon">+</span>
          <span>Добавить новую строку</span>
        </button>
      </div>
    </>
  );
}
