import { useMutation, useQuery } from '@tanstack/react-query';
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ActivityRecordZoneKey,
  getActivityRecordZone,
} from '../../../modules/activity-records/model/activity-record-zone';
import {
  getLicenseRegistrySnapshot,
  refreshLicenseRegistry,
} from '../../../modules/licenses/api/licenses-api';
import { RefreshLicenseRegistryResponse } from '../../../modules/licenses/model/license-registry';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
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
    qaLicenseRows: QaLicenseRowState[];
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
      qaLicenseRows: [createQaLicenseRow()],
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
        qaLicenseRows: parsedState.rows?.qaLicenseRows?.length
          ? parsedState.rows.qaLicenseRows
          : defaultState.rows.qaLicenseRows,
      },
    };
  } catch {
    return defaultState;
  }
}

function hasLicenseDraft(rows: QaLicenseRowState[]): boolean {
  return rows.some((row) => row.licenseType || row.quantity || row.issuedTo);
}

function formatRegistryImportedAt(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneFromSearch = searchParams.get('tab');
  const zoneKey: ActivityRecordZoneKey = isActivityRecordZoneKey(zoneFromSearch)
    ? zoneFromSearch
    : 'qa';
  const [restoredPageState] = useState<ActivityRecordsPageState>(() =>
    readStoredActivityRecordsPageState(),
  );
  const [dateRange, setDateRange] = useState<DateRangeState>(restoredPageState.dateRange);
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
  const [qaLicenseRows, setQaLicenseRows] = useState<QaLicenseRowState[]>(
    restoredPageState.rows.qaLicenseRows,
  );
  const [licenseImportResult, setLicenseImportResult] = useState<RefreshLicenseRegistryResponse | null>(
    null,
  );
  const [hasStoredLicenseRows] = useState(() => hasLicenseDraft(restoredPageState.rows.qaLicenseRows));

  const licenseSnapshotQuery = useQuery({
    queryKey: ['license-registry-snapshot', dateRange.dateFrom, dateRange.dateTo],
    queryFn: () => getLicenseRegistrySnapshot(dateRange),
    enabled: zoneKey === 'licenses',
  });

  const licenseRefreshMutation = useMutation({
    mutationFn: refreshLicenseRegistry,
    onSuccess: (result) => {
      setLicenseImportResult(result);
      setQaLicenseRows(
        result.rows.length > 0
          ? result.rows.map((row) => ({
              id: Math.random().toString(36).slice(2, 10),
              licenseType: row.licenseType,
              quantity: `${row.quantity}`,
              issuedTo: row.issuedTo,
            }))
          : [createQaLicenseRow()],
      );
    },
  });

  useEffect(() => {
    if (!licenseSnapshotQuery.data) {
      return;
    }

    setLicenseImportResult(licenseSnapshotQuery.data.importedAt ? licenseSnapshotQuery.data : null);
    if (hasStoredLicenseRows) {
      return;
    }

    setQaLicenseRows(
      licenseSnapshotQuery.data.rows.length > 0
        ? licenseSnapshotQuery.data.rows.map((row) => ({
            id: Math.random().toString(36).slice(2, 10),
            licenseType: row.licenseType,
            quantity: `${row.quantity}`,
            issuedTo: row.issuedTo,
          }))
        : [createQaLicenseRow()],
    );
  }, [hasStoredLicenseRows, licenseSnapshotQuery.data]);

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
        qaLicenseRows,
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
    qaLicenseRows,
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

  function updateQaLicenseField(
    rowId: string,
    name: keyof Omit<QaLicenseRowState, 'id'>,
    value: string,
  ) {
    setQaLicenseRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  }

  function addQaLicenseRow() {
    setQaLicenseRows((current) => [...current, createQaLicenseRow()]);
  }

  function removeQaLicenseRow(rowId: string) {
    setQaLicenseRows((current) => {
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
      current.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
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

      <section>
        <div className="content-card">
          <DateRangePicker
            variant="panel"
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </section>

      <section>
        <div className="content-card">
          {zone.key === 'qa' ? (
            <div className="page-grid">
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
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaNewBugRows, rowId, name, value)
                      }
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
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaTestedTaskRows, rowId, name, value)
                      }
                      showImpact={false}
                      titleLabel="Название задачи"
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
                      onChangeField={(rowId, name, value) =>
                        updateQaBugField(setQaNewTaskRows, rowId, name, value)
                      }
                      showImpact={false}
                      titleLabel="Название задачи"
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
                      onChangeField={updateQaOtherTaskField}
                      onAddRow={addQaOtherTaskRow}
                      onRemoveRow={removeQaOtherTaskRow}
                    />
                  </div>
                ) : null}
              </section>
            </div>
          ) : zone.key === 'licenses' ? (
            <div className="page-grid">
              <section className="collapsible-section">
                <button
                  type="button"
                  className="collapsible-trigger"
                  onClick={() => setIsLicensesSectionOpen((current) => !current)}
                >
                  <div>
                    <h2 className="collapsible-title">Выдача лицензий</h2>
                    <p className="collapsible-subtitle">
                      Здесь фиксируется выдача лицензий за текущую неделю.
                    </p>
                  </div>
                  <span className="collapsible-indicator">
                    {isLicensesSectionOpen ? '−' : '+'}
                  </span>
                </button>

                {isLicensesSectionOpen ? (
                  <div className="collapsible-content">
                    <div className="qa-license-import-toolbar">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => licenseRefreshMutation.mutate(dateRange)}
                        disabled={licenseRefreshMutation.isPending}
                      >
                        {licenseRefreshMutation.isPending ? 'Обновление...' : 'Обновить из реестра'}
                      </button>

                      {licenseImportResult ? (
                        <div className="qa-license-import-meta">
                          За период найдено {licenseImportResult.matchedSourceRows} строк, сведено в{' '}
                          {licenseImportResult.aggregatedRows} типов лицензий. Последнее обновление из
                          реестра: {formatRegistryImportedAt(licenseImportResult.importedAt)}.
                        </div>
                      ) : (
                        <div className="qa-license-import-meta">
                          Нажмите кнопку, чтобы автоматически заполнить таблицу по выбранному периоду.
                        </div>
                      )}
                    </div>

                    {licenseRefreshMutation.isError ? (
                      <div className="form-inline-notice">
                        Не удалось загрузить данные из реестра: {licenseRefreshMutation.error.message}
                      </div>
                    ) : null}

                    {licenseSnapshotQuery.isError ? (
                      <div className="form-inline-notice">
                        Не удалось загрузить сохраненные данные: {licenseSnapshotQuery.error.message}
                      </div>
                    ) : null}

                    {licenseImportResult && licenseImportResult.warnings.length > 0 ? (
                      <div className="qa-license-import-warnings">
                        В реестре пропущено строк: {licenseImportResult.skippedRows}. Проверьте источник,
                        если ожидаете больше данных.
                      </div>
                    ) : null}

                    <QaLicensesTable
                      rows={qaLicenseRows}
                      onChangeField={updateQaLicenseField}
                      onAddRow={addQaLicenseRow}
                      onRemoveRow={removeQaLicenseRow}
                    />
                  </div>
                ) : null}
              </section>
            </div>
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
  onChangeField: (rowId: string, name: keyof Omit<QaBugFormState, 'id'>, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  showImpact?: boolean;
  titleLabel?: string;
};

function QaBugRowsTable(props: QaBugRowsTableProps) {
  const showImpact = props.showImpact ?? true;
  const titleLabel = props.titleLabel ?? 'Название бага';

  function handleTitleInput(event: FormEvent<HTMLTextAreaElement>, rowId: string) {
    const element = event.currentTarget;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
    props.onChangeField(rowId, 'bugTitle', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className={`qa-bugs-head ${showImpact ? 'qa-bugs-row' : 'qa-bugs-row qa-bugs-row-compact'}`}>
          <div>Проект</div>
          <div>{titleLabel}</div>
          <div>Ссылка на баг</div>
          {showImpact ? <div>Влияние</div> : null}
          <div>Текущий статус</div>
          <div className="qa-bugs-actions-head">Действия</div>
        </div>

        {props.rows.map((row, index) => (
          <div className={showImpact ? 'qa-bugs-row' : 'qa-bugs-row qa-bugs-row-compact'} key={row.id}>
            <input
              className="field-input"
              value={row.projectName}
              onChange={(event) => props.onChangeField(row.id, 'projectName', event.target.value)}
              placeholder={index === 0 ? 'Например: VRC Portal' : 'Проект'}
            />

            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              value={row.bugTitle}
              onInput={(event) => handleTitleInput(event, row.id)}
              placeholder={index === 0 ? `Краткое ${titleLabel.toLowerCase()}` : titleLabel}
            />

            <input
              className="field-input"
              type="url"
              value={row.bugUrl}
              onChange={(event) => props.onChangeField(row.id, 'bugUrl', event.target.value)}
              placeholder="https://..."
            />

            {showImpact ? (
              <select
                className="field-select"
                value={row.bugType}
                onChange={(event) => props.onChangeField(row.id, 'bugType', event.target.value)}
              >
                <option value="">Влияние</option>
                {bugTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            <select
              className="field-select"
              value={row.bugStatus}
              onChange={(event) => props.onChangeField(row.id, 'bugStatus', event.target.value)}
            >
              <option value="">Статус</option>
              {bugStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

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
          <div className="qa-bugs-actions-head">Действия</div>
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
  onChangeField: (
    rowId: string,
    name: keyof Omit<QaOtherTaskRowState, 'id'>,
    value: string,
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
};

function QaOtherTasksTable(props: QaOtherTasksTableProps) {
  function handleDescriptionInput(
    event: FormEvent<HTMLTextAreaElement>,
    rowId: string,
  ) {
    const element = event.currentTarget;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
    props.onChangeField(rowId, 'shortDescription', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-other-tasks-head qa-other-tasks-row">
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
              onChange={(event) => props.onChangeField(row.id, 'taskName', event.target.value)}
              placeholder={index === 0 ? 'Название задачи' : 'Задача'}
            />

            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              value={row.shortDescription}
              onInput={(event) => handleDescriptionInput(event, row.id)}
              placeholder="Краткое описание"
            />

            <input
              className="field-input"
              type="number"
              min="0"
              step="0.5"
              value={row.hours}
              onChange={(event) => props.onChangeField(row.id, 'hours', event.target.value)}
              placeholder="Часы"
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
