import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react';

import {
  getManagementWeeklyReport,
  saveManagementWeeklyReport,
  submitManagementWeeklyReport,
} from '../api/management-weekly-reports-api';
import {
  ManagementProjectStatusCode,
  SaveManagementWeeklyReportPayload,
} from '../model/management-weekly-report';
import { useAuth } from '../../auth/providers/auth-provider';
import { hasPermission } from '../../access/model/access-check';
import { accessPermissions } from '../../access/model/access-permissions';
import { getUsers } from '../../reference-data/api/reference-data-api';
import { UserOption } from '../../reference-data/model/reference-data';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Select } from '../../../shared/ui/select/select';

type ManagementProjectRowState = {
  id: string;
  projectName: string;
  customerName: string;
  description: string;
  statusCode: ManagementProjectStatusCode;
};

type ManagementOtherTaskRowState = {
  id: string;
  taskName: string;
  description: string;
};

type ManagementCategoryRowState = {
  id: string;
  categoryName: string;
  comment: string;
  hours: string;
};

const managementProjectStatusOptions: Array<{ value: ManagementProjectStatusCode; label: string }> = [
  { value: 'in_progress', label: 'В работе' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
];

function createManagementProjectRow(): ManagementProjectRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    projectName: '',
    customerName: '',
    description: '',
    statusCode: 'in_progress',
  };
}

function createManagementOtherTaskRow(): ManagementOtherTaskRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    taskName: '',
    description: '',
  };
}

function createManagementCategoryRow(): ManagementCategoryRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    categoryName: '',
    comment: '',
    hours: '',
  };
}

function getManagementUsers(users: UserOption[]): UserOption[] {
  return users.filter((user) => user.department.code === 'quality-management');
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

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
}

export function ManagementWeeklyReportWorkspace(props: {
  dateRange: DateRangeValue;
}) {
  const auth = useAuth();
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [projectRows, setProjectRows] = useState<ManagementProjectRowState[]>([createManagementProjectRow()]);
  const [otherTaskRows, setOtherTaskRows] = useState<ManagementOtherTaskRowState[]>([
    createManagementOtherTaskRow(),
  ]);
  const [categoryRows, setCategoryRows] = useState<ManagementCategoryRowState[]>([
    createManagementCategoryRow(),
  ]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const currentUser = auth.account?.user;
  const canManageManagementReports = hasPermission(
    auth.account?.permissions ?? [],
    accessPermissions.reportsManagementView,
  );
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: canManageManagementReports,
  });
  const allUsers = usersQuery.data ?? [];
  const managementUsers = getManagementUsers(allUsers);
  const currentAccountUser = currentUser
    ? allUsers.find((user) => user.id === currentUser.id) ?? null
    : null;
  const availableUsers =
    managementUsers.length > 0
      ? currentAccountUser && !managementUsers.some((user) => user.id === currentAccountUser.id)
        ? [currentAccountUser, ...managementUsers]
        : managementUsers
      : currentAccountUser
        ? [currentAccountUser]
        : allUsers;
  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? null;

  const managementWeeklyReportQuery = useQuery({
    queryKey: ['management-weekly-report', selectedUser?.id, props.dateRange.dateFrom],
    enabled: Boolean(selectedUser?.id),
    queryFn: () =>
      getManagementWeeklyReport({
        userId: selectedUser!.id,
        weekStart: props.dateRange.dateFrom,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: saveManagementWeeklyReport,
    onSuccess: () => {
      setSaveMessage('Недельный Management-отчет сохранен.');
      void managementWeeklyReportQuery.refetch();
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitManagementWeeklyReport,
    onSuccess: () => {
      setSaveMessage('Недельный Management-отчет отправлен.');
      void managementWeeklyReportQuery.refetch();
    },
  });

  useEffect(() => {
    setSaveMessage(null);
  }, [props.dateRange.dateFrom, props.dateRange.dateTo, selectedUserId]);

  useEffect(() => {
    if (availableUsers.length === 0 || selectedUserId) {
      return;
    }

    const preferredUser = currentAccountUser
      ? availableUsers.find((user) => user.id === currentAccountUser.id) ?? null
      : null;
    setSelectedUserId((preferredUser ?? availableUsers[0]).id);
  }, [availableUsers, currentAccountUser, selectedUserId]);

  useEffect(() => {
    const report = managementWeeklyReportQuery.data;

    if (managementWeeklyReportQuery.isFetched && !report) {
      setProjectRows([createManagementProjectRow()]);
      setOtherTaskRows([createManagementOtherTaskRow()]);
      setCategoryRows([createManagementCategoryRow()]);
      return;
    }

    if (!report) {
      return;
    }

    setProjectRows(
      report.projectItems.length > 0
        ? report.projectItems.map((item) => ({
            id: item.id,
            projectName: item.projectName,
            customerName: item.customerName,
            description: item.description ?? '',
            statusCode: item.statusCode,
          }))
        : [createManagementProjectRow()],
    );
    setOtherTaskRows(
      report.otherTaskItems.length > 0
        ? report.otherTaskItems.map((item) => ({
            id: item.id,
            taskName: item.taskName,
            description: item.description ?? '',
          }))
        : [createManagementOtherTaskRow()],
    );
    setCategoryRows(
      report.categoryItems.length > 0
        ? report.categoryItems.map((item) => ({
            id: item.id,
            categoryName: item.categoryName,
            comment: item.comment ?? '',
            hours: toHoursString(item.durationMinutes),
          }))
        : [createManagementCategoryRow()],
    );
  }, [managementWeeklyReportQuery.data, managementWeeklyReportQuery.isFetched]);

  useEffect(() => {
    for (const row of [...projectRows, ...otherTaskRows, ...categoryRows]) {
      resizeTextarea(textareaRefs.current[row.id] ?? null);
    }
  }, [projectRows, otherTaskRows, categoryRows]);

  if (!currentUser) {
    return (
      <EmptyState
        title="Аккаунт не загружен"
        message="Невозможно определить текущего пользователя для сохранения недельного отчета."
      />
    );
  }

  if (usersQuery.isLoading) {
    return <div className="muted-text">Loading users...</div>;
  }

  if (usersQuery.isError) {
    return (
      <EmptyState
        title="Не удалось загрузить пользователей"
        message="Список сотрудников нужен для выбора, за кого формируется weekly report."
      />
    );
  }

  if (!selectedUser) {
    return (
      <EmptyState
        title="Пользователи недоступны"
        message="В системе нет доступных сотрудников для создания Management weekly report."
      />
    );
  }

  const activeSelectedUser = selectedUser;
  const isSubmitted = managementWeeklyReportQuery.data?.status === 'submitted';
  const isBusy = saveMutation.isPending || submitMutation.isPending;

  function updateProjectRow(
    rowId: string,
    field: keyof Omit<ManagementProjectRowState, 'id'>,
    value: string,
  ) {
    setProjectRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function updateOtherTaskRow(
    rowId: string,
    field: keyof Omit<ManagementOtherTaskRowState, 'id'>,
    value: string,
  ) {
    setOtherTaskRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function updateCategoryRow(
    rowId: string,
    field: keyof Omit<ManagementCategoryRowState, 'id'>,
    value: string,
  ) {
    setCategoryRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? { ...row, [field]: field === 'hours' ? sanitizeHoursInput(value) : value }
          : row,
      ),
    );
  }

  function buildPayload(): SaveManagementWeeklyReportPayload {
    return {
      userId: activeSelectedUser.id,
      departmentId: activeSelectedUser.department.id,
      weekStart: props.dateRange.dateFrom,
      weekEnd: props.dateRange.dateTo,
      projectItems: projectRows
        .filter((row) => row.projectName.trim() || row.customerName.trim() || row.description.trim())
        .map((row) => ({
          projectName: row.projectName.trim(),
          customerName: row.customerName.trim(),
          description: row.description.trim() || undefined,
          statusCode: row.statusCode,
        })),
      otherTaskItems: otherTaskRows
        .filter((row) => row.taskName.trim() || row.description.trim())
        .map((row) => ({
          taskName: row.taskName.trim(),
          description: row.description.trim() || undefined,
        })),
      categoryItems: categoryRows
        .filter((row) => row.categoryName.trim() || row.comment.trim() || row.hours.trim())
        .map((row) => ({
          categoryName: row.categoryName.trim(),
          comment: row.comment.trim() || undefined,
          durationMinutes: toDurationMinutes(row.hours),
        })),
    };
  }

  function handleSave() {
    setSaveMessage(null);
    saveMutation.mutate(buildPayload());
  }

  function handleSubmit() {
    if (!managementWeeklyReportQuery.data?.id) {
      return;
    }

    setSaveMessage(null);
    submitMutation.mutate(managementWeeklyReportQuery.data.id);
  }

  return (
    <div className="page-grid">
      <div className="reports-toolbar">
        <div className="reports-toolbar-copy">
          <h2 className="collapsible-title">Management weekly input</h2>
          <p className="collapsible-subtitle">
            Текущая неделя: {props.dateRange.dateFrom} - {props.dateRange.dateTo}
          </p>
        </div>
        <div className="reports-toolbar-actions">
          <div className="qa-topbar-user-filter">
            <span className="qa-topbar-user-label">Сотрудник</span>
            <Select
              className="qa-topbar-user-select"
              value={selectedUserId}
              onChange={setSelectedUserId}
              disabled={isBusy}
              options={availableUsers.map((user) => ({
                value: user.id,
                label: formatManagementReportUserOption(user),
              }))}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleSave} disabled={isBusy || isSubmitted}>
            Сохранить черновик
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy || isSubmitted || !managementWeeklyReportQuery.data?.id}
          >
            {submitMutation.isPending ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </div>

      {saveMessage ? <div className="pill pill-neutral">{saveMessage}</div> : null}
      {saveMutation.isError ? <div className="form-error">{saveMutation.error.message}</div> : null}
      {submitMutation.isError ? <div className="form-error">{submitMutation.error.message}</div> : null}

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Работа над проектами</h2>
          </div>
        </div>
        <ManagementProjectsEditor
          rows={projectRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setProjectRows((current) => [...current, createManagementProjectRow()])}
          onRemoveRow={(rowId) =>
            setProjectRows((current) =>
              current.length === 1 ? current : current.filter((row) => row.id !== rowId),
            )
          }
          onChangeField={updateProjectRow}
          textareaRefs={textareaRefs}
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Прочие задачи</h2>
          </div>
        </div>
        <ManagementOtherTasksEditor
          rows={otherTaskRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setOtherTaskRows((current) => [...current, createManagementOtherTaskRow()])}
          onRemoveRow={(rowId) =>
            setOtherTaskRows((current) =>
              current.length === 1 ? current : current.filter((row) => row.id !== rowId),
            )
          }
          onChangeField={updateOtherTaskRow}
          textareaRefs={textareaRefs}
        />
      </section>

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Задачи по категориям</h2>
          </div>
        </div>
        <ManagementCategoriesEditor
          rows={categoryRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setCategoryRows((current) => [...current, createManagementCategoryRow()])}
          onRemoveRow={(rowId) =>
            setCategoryRows((current) =>
              current.length === 1 ? current : current.filter((row) => row.id !== rowId),
            )
          }
          onChangeField={updateCategoryRow}
          textareaRefs={textareaRefs}
        />
      </section>
    </div>
  );
}

function formatManagementReportUserOption(user: UserOption) {
  return user.fullName;
}

function ManagementProjectsEditor(props: {
  rows: ManagementProjectRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<ManagementProjectRowState, 'id'>,
    value: string,
  ) => void;
  textareaRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}) {
  function handleDescriptionInput(event: FormEvent<HTMLTextAreaElement>, rowId: string) {
    const element = event.currentTarget;
    resizeTextarea(element);
    props.onChangeField(rowId, 'description', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-bugs-head support-projects-row">
          <div>Название проекта</div>
          <div>Заказчик</div>
          <div>Краткое описание</div>
          <div>Статус</div>
          <div aria-hidden="true" />
        </div>

        {props.rows.map((row, index) => (
          <div className="support-projects-row" key={row.id}>
            <input
              className="field-input"
              value={row.projectName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'projectName', event.target.value)}
              placeholder={index === 0 ? 'Название проекта' : 'Проект'}
            />
            <input
              className="field-input"
              value={row.customerName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'customerName', event.target.value)}
              placeholder="Заказчик"
            />
            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              ref={(element) => {
                props.textareaRefs.current[row.id] = element;
              }}
              value={row.description}
              disabled={props.disabled}
              onInput={(event) => handleDescriptionInput(event, row.id)}
              placeholder="Краткое описание"
            />
            <select
              className="field-select"
              value={row.statusCode}
              disabled={props.disabled}
              onChange={(event) =>
                props.onChangeField(row.id, 'statusCode', event.target.value as ManagementProjectStatusCode)
              }
            >
              {managementProjectStatusOptions.map((option) => (
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

function ManagementOtherTasksEditor(props: {
  rows: ManagementOtherTaskRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<ManagementOtherTaskRowState, 'id'>,
    value: string,
  ) => void;
  textareaRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}) {
  function handleDescriptionInput(event: FormEvent<HTMLTextAreaElement>, rowId: string) {
    const element = event.currentTarget;
    resizeTextarea(element);
    props.onChangeField(rowId, 'description', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-bugs-head support-other-tasks-row">
          <div>Задача</div>
          <div>Краткое описание</div>
          <div aria-hidden="true" />
        </div>

        {props.rows.map((row, index) => (
          <div className="support-other-tasks-row" key={row.id}>
            <input
              className="field-input"
              value={row.taskName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'taskName', event.target.value)}
              placeholder={index === 0 ? 'Задача' : 'Название задачи'}
            />
            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              ref={(element) => {
                props.textareaRefs.current[row.id] = element;
              }}
              value={row.description}
              disabled={props.disabled}
              onInput={(event) => handleDescriptionInput(event, row.id)}
              placeholder="Краткое описание"
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

function ManagementCategoriesEditor(props: {
  rows: ManagementCategoryRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<ManagementCategoryRowState, 'id'>,
    value: string,
  ) => void;
  textareaRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}) {
  function handleCommentInput(event: FormEvent<HTMLTextAreaElement>, rowId: string) {
    const element = event.currentTarget;
    resizeTextarea(element);
    props.onChangeField(rowId, 'comment', element.value);
  }

  return (
    <>
      <div className="qa-bugs-grid">
        <div className="qa-bugs-head support-categories-row">
          <div>Категория</div>
          <div>Комментарий</div>
          <div>Часы</div>
          <div aria-hidden="true" />
        </div>

        {props.rows.map((row, index) => (
          <div className="support-categories-row" key={row.id}>
            <input
              className="field-input"
              value={row.categoryName}
              disabled={props.disabled}
              onChange={(event) => props.onChangeField(row.id, 'categoryName', event.target.value)}
              placeholder={index === 0 ? 'Категория' : 'Название категории'}
            />
            <textarea
              className="field-textarea qa-inline-textarea"
              rows={1}
              ref={(element) => {
                props.textareaRefs.current[row.id] = element;
              }}
              value={row.comment}
              disabled={props.disabled}
              onInput={(event) => handleCommentInput(event, row.id)}
              placeholder="Комментарий"
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
