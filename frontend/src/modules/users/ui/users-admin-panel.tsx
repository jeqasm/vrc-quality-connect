import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';

import {
  createRegistrationInvite,
  CreatedRegistrationInvite,
  deleteRegistrationInvite,
  getRegistrationInvites,
} from '../../auth/api/auth-api';
import { deleteUser, getDepartments, getUsers } from '../../reference-data/api/reference-data-api';
import { ReferenceOption, UserOption } from '../../reference-data/model/reference-data';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';
import { Modal } from '../../../shared/ui/modal/modal';

const roleOptions = [
  { code: 'employee', label: 'Сотрудник' },
  { code: 'manager', label: 'Менеджер' },
  { code: 'administrator', label: 'Администратор' },
];

const expirationOptions = [
  { value: 3, label: '3 дня' },
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function UsersAdminPanel() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInvitesOpen, setIsInvitesOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteDeleteErrorMessage, setInviteDeleteErrorMessage] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<CreatedRegistrationInvite | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserOption | null>(null);
  const [formState, setFormState] = useState({
    email: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    accessRoleCode: roleOptions[0].code,
    expiresInDays: expirationOptions[1].value,
  });

  const invitesQuery = useQuery({
    queryKey: ['auth', 'registration-invites'],
    queryFn: getRegistrationInvites,
  });
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
  const activeInvitesCount = invitesQuery.data?.filter((invite) => invite.usedAt === null).length ?? 0;

  const registrationLink = useMemo(() => {
    if (!generatedInvite) {
      return '';
    }

    return `${window.location.origin}/register?invite=${generatedInvite.inviteToken}`;
  }, [generatedInvite]);

  const createInviteMutation = useMutation({
    mutationFn: createRegistrationInvite,
    onSuccess: async (invite) => {
      setGeneratedInvite(invite);
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'registration-invites'] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось создать ссылку');
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: deleteRegistrationInvite,
    onSuccess: async () => {
      setInviteDeleteErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'registration-invites'] });
    },
    onError: (error) => {
      setInviteDeleteErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить приглашение',
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setDeleteErrorMessage(null);
      setUserToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      setDeleteErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить пользователя');
    },
  });

  async function handleCopyInviteLink() {
    if (!registrationLink) {
      return;
    }

    await navigator.clipboard.writeText(registrationLink);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFirstName = formState.firstName.trim();
    const normalizedLastName = formState.lastName.trim();

    if (!normalizedFirstName || !normalizedLastName) {
      setErrorMessage('Укажи имя и фамилию для приглашения');
      return;
    }

    setErrorMessage(null);

    createInviteMutation.mutate({
      email: formState.email.trim() || undefined,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      departmentId: formState.departmentId,
      accessRoleCode: formState.accessRoleCode,
      expiresInDays: formState.expiresInDays,
    });
  }

  return (
    <div className="page-grid users-admin-panel">
      <section className="content-card users-admin-card">
        <div className="section-heading">
          <button
            type="button"
            className={`users-accordion-trigger${isInvitesOpen ? ' users-accordion-trigger-open' : ''}`}
            onClick={() => setIsInvitesOpen((current) => !current)}
          >
            <span className="users-accordion-copy">
              <div className="users-accordion-title-row">
                <h2>Активные приглашения</h2>
                <span className="users-count-pill">{activeInvitesCount}</span>
              </div>
            </span>
            <span
              className={`users-accordion-icon${isInvitesOpen ? ' users-accordion-icon-open' : ''}`}
              aria-hidden="true"
            >
              <span className="users-accordion-chevron" />
            </span>
          </button>
        </div>

        {isInvitesOpen ? (
          invitesQuery.data && invitesQuery.data.length > 0 ? (
            <div className="stack-md">
              {inviteDeleteErrorMessage ? (
                <div className="form-inline-notice">{inviteDeleteErrorMessage}</div>
              ) : null}
              {invitesQuery.data.map((invite) => (
                <article key={invite.id} className="invite-summary-row">
                  <div className="invite-summary-main">
                    <strong>{invite.email ?? 'Свободная ссылка без привязки к email'}</strong>
                    <div className="muted-text">
                      {invite.accessRole.name} · {invite.department.name}
                    </div>
                  </div>
                  <div className="invite-summary-side">
                    <div className="invite-summary-meta">
                      <span>{invite.usedAt ? 'Использована' : 'Активна'}</span>
                      <span>До {formatDate(invite.expiresAt)}</span>
                    </div>
                    {!invite.usedAt ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="invite-delete-button"
                        disabled={deleteInviteMutation.isPending}
                        onClick={() => {
                          setInviteDeleteErrorMessage(null);
                          deleteInviteMutation.mutate(invite.id);
                        }}
                        aria-label={`Удалить приглашение ${invite.email ?? invite.id}`}
                        title="Удалить приглашение"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 7V5C9 4.4 9.4 4 10 4H14C14.6 4 15 4.4 15 5V7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7 7L8 19C8.1 19.6 8.5 20 9.1 20H14.9C15.5 20 15.9 19.6 16 19L17 7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M10 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M14 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="compact-empty-state">
              <strong>Приглашений пока нет</strong>
            </div>
          )
        ) : null}
      </section>

      <section className="content-card users-admin-card">
        <div className="section-heading">
          <div>
            <h2>Пользователи</h2>
            <p className="card-subtitle">Список аккаунтов, которые уже зарегистрированы в системе.</p>
          </div>
          <Button
            type="button"
            className="users-add-button"
            onClick={() => {
              setIsCreateModalOpen(true);
              setGeneratedInvite(null);
              setErrorMessage(null);
            }}
          >
            Добавить пользователя
          </Button>
        </div>

        {usersQuery.data && usersQuery.data.length > 0 ? (
          <div className="stack-md">
            {usersQuery.data.map((user: UserOption) => (
              <article key={user.id} className="user-summary-row">
                <div className="user-summary-main">
                  <strong>{user.fullName}</strong>
                  <div className="muted-text">{user.email}</div>
                </div>
                <div className="user-summary-side">
                  <div className="user-summary-meta">
                    <span>{user.accessRole.name}</span>
                    <span>{user.department.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="users-delete-button"
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteErrorMessage(null);
                    }}
                    aria-label={`Удалить пользователя ${user.fullName}`}
                    title="Удалить"
                  >
                    <span aria-hidden="true">🗑</span>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Пользователей пока нет"
            message="Добавь первого пользователя через приглашение, и он появится в этом списке."
          />
        )}
      </section>

      <Modal
        isOpen={Boolean(userToDelete)}
        title="Удалить пользователя"
        description="Удаление необратимо. Вместе с аккаунтом будут удалены связанные операционные записи пользователя."
        onClose={() => {
          if (deleteUserMutation.isPending) {
            return;
          }

          setUserToDelete(null);
          setDeleteErrorMessage(null);
        }}
      >
        {userToDelete ? (
          <div className="form-grid">
            <div className="compact-empty-state">
              <strong>{userToDelete.fullName}</strong>
              <div className="muted-text">{userToDelete.email}</div>
            </div>

            {deleteErrorMessage ? <div className="form-inline-notice">{deleteErrorMessage}</div> : null}

            <div className="actions-row">
              <Button
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
              >
                {deleteUserMutation.isPending ? 'Удаление...' : 'Подтвердить удаление'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={deleteUserMutation.isPending}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteErrorMessage(null);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        title="Создать ссылку регистрации"
        description="Приглашение фиксирует роль и отдел. Пользователь сможет зарегистрироваться только по этой ссылке."
        onClose={() => {
          if (createInviteMutation.isPending) {
            return;
          }

          setIsCreateModalOpen(false);
          setErrorMessage(null);
          setGeneratedInvite(null);
        }}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField htmlFor="invite-email" label="Email (необязательно)">
            <Input
              id="invite-email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@company.com"
            />
          </FormField>

          <div className="two-column-grid">
            <FormField htmlFor="invite-first-name" label="Имя">
              <Input
                id="invite-first-name"
                value={formState.firstName}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, firstName: event.target.value }))
                }
                placeholder="Иван"
                required
              />
            </FormField>

            <FormField htmlFor="invite-last-name" label="Фамилия">
              <Input
                id="invite-last-name"
                value={formState.lastName}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, lastName: event.target.value }))
                }
                placeholder="Иванов"
                required
              />
            </FormField>
          </div>

          <FormField htmlFor="invite-department" label="Отдел">
            <select
              id="invite-department"
              className="field-select"
              value={formState.departmentId}
              onChange={(event) =>
                setFormState((current) => ({ ...current, departmentId: event.target.value }))
              }
              required
            >
              <option value="">Выбери отдел</option>
              {(departmentsQuery.data ?? []).map((department: ReferenceOption) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField htmlFor="invite-role" label="Роль">
            <select
              id="invite-role"
              className="field-select"
              value={formState.accessRoleCode}
              onChange={(event) =>
                setFormState((current) => ({ ...current, accessRoleCode: event.target.value }))
              }
            >
              {roleOptions.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField htmlFor="invite-expiration" label="Срок действия">
            <select
              id="invite-expiration"
              className="field-select"
              value={String(formState.expiresInDays)}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  expiresInDays: Number(event.target.value),
                }))
              }
            >
              {expirationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          {errorMessage ? <div className="form-inline-notice">{errorMessage}</div> : null}

          {generatedInvite ? (
            <div className="invite-link-panel">
              <div className="invite-link-panel-copy">
                <strong>Ссылка готова</strong>
                <div className="muted-text">
                  {generatedInvite.accessRole.name} · {generatedInvite.department.name}
                </div>
              </div>
              <Input value={registrationLink} readOnly />
              <div className="actions-row">
                <Button type="button" onClick={() => void handleCopyInviteLink()}>
                  Копировать ссылку
                </Button>
              </div>
            </div>
          ) : null}

          <div className="actions-row">
            <Button
              type="submit"
              disabled={createInviteMutation.isPending || departmentsQuery.isLoading}
            >
              {createInviteMutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={createInviteMutation.isPending}
              onClick={() => {
                setIsCreateModalOpen(false);
                setGeneratedInvite(null);
                setErrorMessage(null);
              }}
            >
              Закрыть
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
