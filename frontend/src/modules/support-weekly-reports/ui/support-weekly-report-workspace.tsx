import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react';

import {
  getSupportWeeklyReport,
  saveSupportWeeklyReport,
  submitSupportWeeklyReport,
} from '../api/support-weekly-reports-api';
import {
  SaveSupportWeeklyReportPayload,
  SupportProjectStatusCode,
} from '../model/support-weekly-report';
import { useAuth } from '../../auth/providers/auth-provider';
import { hasPermission } from '../../access/model/access-check';
import { accessPermissions } from '../../access/model/access-permissions';
import { getUsers } from '../../reference-data/api/reference-data-api';
import { UserOption } from '../../reference-data/model/reference-data';
import { DateRangeValue } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Modal } from '../../../shared/ui/modal/modal';
import { Select } from '../../../shared/ui/select/select';

type SupportProjectRowState = {
  id: string;
  projectName: string;
  customerName: string;
  description: string;
  statusCode: SupportProjectStatusCode;
};

type SupportOtherTaskRowState = {
  id: string;
  taskName: string;
  description: string;
};

type SupportCategoryRowState = {
  id: string;
  categoryName: string;
  comment: string;
  hours: string;
};

const supportProjectStatusOptions: Array<{ value: SupportProjectStatusCode; label: string }> = [
  { value: 'in_progress', label: 'В работе' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
];

function createSupportProjectRow(): SupportProjectRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    projectName: '',
    customerName: '',
    description: '',
    statusCode: 'in_progress',
  };
}

function createSupportOtherTaskRow(): SupportOtherTaskRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    taskName: '',
    description: '',
  };
}

function createSupportCategoryRow(): SupportCategoryRowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    categoryName: '',
    comment: '',
    hours: '',
  };
}

function getSupportUsers(users: UserOption[]): UserOption[] {
  return users.filter((user) => user.department.code === 'technical-support');
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

export function SupportWeeklyReportWorkspace(props: {
  dateRange: DateRangeValue;
}) {
  const auth = useAuth();
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [projectRows, setProjectRows] = useState<SupportProjectRowState[]>([createSupportProjectRow()]);
  const [otherTaskRows, setOtherTaskRows] = useState<SupportOtherTaskRowState[]>([
    createSupportOtherTaskRow(),
  ]);
  const [categoryRows, setCategoryRows] = useState<SupportCategoryRowState[]>([
    createSupportCategoryRow(),
  ]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaveSuccessMessage, setIsSaveSuccessMessage] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const currentUser = auth.account?.user;
  const currentAccountUser: UserOption | null = currentUser
    ? {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        accessRole: currentUser.accessRole,
        department: currentUser.department,
      }
    : null;
  const canManageSupportReports = hasPermission(
    auth.account?.permissions ?? [],
    accessPermissions.reportsSupportView,
  );
  const canLoadUsers = hasPermission(
    auth.account?.permissions ?? [],
    accessPermissions.usersManage,
  );
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: canManageSupportReports && canLoadUsers,
  });
  const allUsers = usersQuery.data ?? [];
  const supportUsers = getSupportUsers(allUsers);
  const availableUsers =
    canLoadUsers
      ? supportUsers.length > 0
        ? currentAccountUser && !supportUsers.some((user) => user.id === currentAccountUser.id)
          ? [currentAccountUser, ...supportUsers]
          : supportUsers
        : currentAccountUser
          ? [currentAccountUser]
          : allUsers
      : currentAccountUser
        ? [currentAccountUser]
        : [];
  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? null;

  const supportWeeklyReportQuery = useQuery({
    queryKey: ['support-weekly-report', selectedUser?.id, props.dateRange.dateFrom],
    enabled: Boolean(selectedUser?.id),
    queryFn: () =>
      getSupportWeeklyReport({
        userId: selectedUser!.id,
        weekStart: props.dateRange.dateFrom,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: saveSupportWeeklyReport,
    onSuccess: () => {
      setSaveMessage('Отчет сохранен как черновик');
      setIsSaveSuccessMessage(true);
      void supportWeeklyReportQuery.refetch();
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitSupportWeeklyReport,
    onSuccess: () => {
      setSaveMessage('Недельный Technical Support-отчет отправлен.');
      setIsSaveSuccessMessage(false);
      void supportWeeklyReportQuery.refetch();
    },
  });

  useEffect(() => {
    setSaveMessage(null);
    setIsSaveSuccessMessage(false);
    setIsSubmitConfirmOpen(false);
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
    const report = supportWeeklyReportQuery.data;

    if (supportWeeklyReportQuery.isFetched && !report) {
      setProjectRows([createSupportProjectRow()]);
      setOtherTaskRows([createSupportOtherTaskRow()]);
      setCategoryRows([createSupportCategoryRow()]);
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
        : [createSupportProjectRow()],
    );
    setOtherTaskRows(
      report.otherTaskItems.length > 0
        ? report.otherTaskItems.map((item) => ({
            id: item.id,
            taskName: item.taskName,
            description: item.description ?? '',
          }))
        : [createSupportOtherTaskRow()],
    );
    setCategoryRows(
      report.categoryItems.length > 0
        ? report.categoryItems.map((item) => ({
            id: item.id,
            categoryName: item.categoryName,
            comment: item.comment ?? '',
            hours: toHoursString(item.durationMinutes),
          }))
        : [createSupportCategoryRow()],
    );
  }, [supportWeeklyReportQuery.data, supportWeeklyReportQuery.isFetched]);

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

  if (canLoadUsers && usersQuery.isLoading) {
    return <div className="muted-text">Loading users...</div>;
  }

  if (canLoadUsers && usersQuery.isError) {
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
        message="В системе нет доступных сотрудников для создания Technical Support weekly report."
      />
    );
  }

  const activeSelectedUser = selectedUser;
  const isSubmitted = supportWeeklyReportQuery.data?.status === 'submitted';
  const isBusy = saveMutation.isPending || submitMutation.isPending;

  function updateProjectRow(
    rowId: string,
    field: keyof Omit<SupportProjectRowState, 'id'>,
    value: string,
  ) {
    setProjectRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function updateOtherTaskRow(
    rowId: string,
    field: keyof Omit<SupportOtherTaskRowState, 'id'>,
    value: string,
  ) {
    setOtherTaskRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function updateCategoryRow(
    rowId: string,
    field: keyof Omit<SupportCategoryRowState, 'id'>,
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

  function buildPayload(): SaveSupportWeeklyReportPayload {
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
    setIsSaveSuccessMessage(false);
    saveMutation.mutate(buildPayload());
  }

  function handleSubmitClick() {
    setSaveMessage(null);
    setIsSaveSuccessMessage(false);
    setIsSubmitConfirmOpen(true);
  }

  async function handleSubmitConfirm() {
    setIsSubmitConfirmOpen(false);

    let reportId = supportWeeklyReportQuery.data?.id;

    if (!reportId) {
      const savedReport = await saveMutation.mutateAsync(buildPayload());
      reportId = savedReport.id;
    }

    await submitMutation.mutateAsync(reportId);
  }

  return (
    <div className="page-grid">
      <div className="reports-toolbar">
        <div className="reports-toolbar-copy">
          <h2 className="collapsible-title">Technical Support weekly input</h2>
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
                label: formatSupportReportUserOption(user),
              }))}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleSave} disabled={isBusy || isSubmitted}>
            Сохранить черновик
          </Button>
          <Button
            type="button"
            onClick={handleSubmitClick}
            disabled={isBusy || isSubmitted}
          >
            {submitMutation.isPending ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </div>

      {saveMessage ? (
        <div className={isSaveSuccessMessage ? 'form-inline-notice form-inline-notice-info' : 'pill pill-neutral'}>
          {saveMessage}
        </div>
      ) : null}
      {saveMutation.isError ? <div className="form-error">{saveMutation.error.message}</div> : null}
      {submitMutation.isError ? <div className="form-error">{submitMutation.error.message}</div> : null}
      {isSubmitted ? (
        <div className="form-inline-notice form-inline-notice-warning">
          Отчет уже отправлен. Для внесения изменений обратитесь к администратору
        </div>
      ) : null}

      <section className="content-card">
        <div className="qa-report-section-head">
          <div className="section-heading">
            <h2>Работа над проектами</h2>
          </div>
        </div>
        <SupportProjectsEditor
          rows={projectRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setProjectRows((current) => [...current, createSupportProjectRow()])}
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
        <SupportOtherTasksEditor
          rows={otherTaskRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setOtherTaskRows((current) => [...current, createSupportOtherTaskRow()])}
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
        <SupportCategoriesEditor
          rows={categoryRows}
          disabled={isBusy || isSubmitted}
          onAddRow={() => setCategoryRows((current) => [...current, createSupportCategoryRow()])}
          onRemoveRow={(rowId) =>
            setCategoryRows((current) =>
              current.length === 1 ? current : current.filter((row) => row.id !== rowId),
            )
          }
          onChangeField={updateCategoryRow}
          textareaRefs={textareaRefs}
        />
      </section>

      <Modal
        isOpen={isSubmitConfirmOpen}
        title="Подтвердите отправку отчета"
        description="После отправки дальнейшие изменения будут невозможны. Отправить отчет?"
        onClose={() => {
          if (submitMutation.isPending) {
            return;
          }

          setIsSubmitConfirmOpen(false);
        }}
      >
        <div className="actions-row">
          <Button type="button" disabled={isBusy} onClick={() => void handleSubmitConfirm()}>
            {submitMutation.isPending ? 'Отправка...' : 'Отправить'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => setIsSubmitConfirmOpen(false)}
          >
            Отмена
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function formatSupportReportUserOption(user: UserOption) {
  return user.fullName;
}

function SupportProjectsEditor(props: {
  rows: SupportProjectRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<SupportProjectRowState, 'id'>,
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
                props.onChangeField(row.id, 'statusCode', event.target.value as SupportProjectStatusCode)
              }
            >
              {supportProjectStatusOptions.map((option) => (
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

function SupportOtherTasksEditor(props: {
  rows: SupportOtherTaskRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<SupportOtherTaskRowState, 'id'>,
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

function SupportCategoriesEditor(props: {
  rows: SupportCategoryRowState[];
  disabled: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeField: (
    rowId: string,
    field: keyof Omit<SupportCategoryRowState, 'id'>,
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
