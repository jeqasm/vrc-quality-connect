import { Dispatch, SetStateAction, useState } from 'react';

import {
  ActivityRecordZoneKey,
  getActivityRecordZone,
} from '../../../modules/activity-records/model/activity-record-zone';
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

const licenseTypeOptions = [
  { value: 'demo', label: 'Demo' },
  { value: 'student', label: 'Student' },
  { value: 'academic', label: 'Academic' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'temporary', label: 'Temporary' },
];

export function ActivityRecordsPage() {
  const [zoneKey, setZoneKey] = useState<ActivityRecordZoneKey>('qa');
  const [dateRange, setDateRange] = useState<DateRangeState>(initialDateRangeState);
  const [isRetestSectionOpen, setIsRetestSectionOpen] = useState(true);
  const [isNewBugsSectionOpen, setIsNewBugsSectionOpen] = useState(true);
  const [isTestedTasksSectionOpen, setIsTestedTasksSectionOpen] = useState(true);
  const [isNewTasksSectionOpen, setIsNewTasksSectionOpen] = useState(true);
  const [isOtherTasksSectionOpen, setIsOtherTasksSectionOpen] = useState(true);
  const [isLicensesSectionOpen, setIsLicensesSectionOpen] = useState(true);
  const [qaRetestRows, setQaRetestRows] = useState<QaBugFormState[]>([createQaBugRow()]);
  const [qaNewBugRows, setQaNewBugRows] = useState<QaBugFormState[]>([createQaBugRow()]);
  const [qaTestedTaskRows, setQaTestedTaskRows] = useState<QaBugFormState[]>([createQaBugRow()]);
  const [qaNewTaskRows, setQaNewTaskRows] = useState<QaBugFormState[]>([createQaBugRow()]);
  const [qaOtherTaskRows, setQaOtherTaskRows] = useState<QaOtherTaskRowState[]>([
    createQaOtherTaskRow(),
  ]);
  const [qaLicenseRows, setQaLicenseRows] = useState<QaLicenseRowState[]>([createQaLicenseRow()]);

  const zone = getActivityRecordZone(zoneKey);

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
    <div className="page-grid">
      <TopBar
        title="Activity records workspace"
        subtitle={zone.subtitle}
      />

      <section className="zone-tabs-shell" aria-label="Activity zones">
        <div className="zone-tabs">
          {(['qa', 'licenses', 'support', 'management'] as ActivityRecordZoneKey[]).map((item) => {
            const itemZone = getActivityRecordZone(item);
            const isActive = zoneKey === item;

            return (
              <button
                key={item}
                type="button"
                className={`zone-tab${isActive ? ' zone-tab-active' : ''}`}
                onClick={() => setZoneKey(item)}
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
};

function QaBugRowsTable(props: QaBugRowsTableProps) {
  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-bugs-head qa-bugs-row">
          <div>Проект</div>
          <div>Название бага</div>
          <div>Ссылка на баг</div>
          <div>Влияние</div>
          <div>Текущий статус</div>
          <div className="qa-bugs-actions-head">Действия</div>
        </div>

        {props.rows.map((row, index) => (
          <div className="qa-bugs-row" key={row.id}>
            <input
              className="field-input"
              value={row.projectName}
              onChange={(event) => props.onChangeField(row.id, 'projectName', event.target.value)}
              placeholder={index === 0 ? 'Например: VRC Portal' : 'Проект'}
            />

            <input
              className="field-input"
              value={row.bugTitle}
              onChange={(event) => props.onChangeField(row.id, 'bugTitle', event.target.value)}
              placeholder={index === 0 ? 'Краткое название бага' : 'Название бага'}
            />

            <input
              className="field-input"
              type="url"
              value={row.bugUrl}
              onChange={(event) => props.onChangeField(row.id, 'bugUrl', event.target.value)}
              placeholder="https://..."
            />

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
            <select
              className="field-select"
              value={row.licenseType}
              onChange={(event) => props.onChangeField(row.id, 'licenseType', event.target.value)}
            >
              <option value="">Тип лицензии</option>
              {licenseTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

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

            <input
              className="field-input"
              value={row.shortDescription}
              onChange={(event) =>
                props.onChangeField(row.id, 'shortDescription', event.target.value)
              }
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
