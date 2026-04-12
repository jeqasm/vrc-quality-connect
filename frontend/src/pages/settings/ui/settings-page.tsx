import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { accessPermissions } from '../../../modules/access/model/access-permissions';
import { hasPermission } from '../../../modules/access/model/access-check';
import { updateCurrentAccount } from '../../../modules/auth/api/auth-api';
import { useAuth } from '../../../modules/auth/providers/auth-provider';
import { GroupsAdminPanel } from '../../../modules/groups/ui/groups-admin-panel';
import { UsersAdminPanel } from '../../../modules/users/ui/users-admin-panel';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

function splitFullName(fullName: string | undefined): { firstName: string; lastName: string } {
  const normalizedFullName = (fullName ?? '').trim();

  if (!normalizedFullName) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const parts = normalizedFullName.split(/\s+/);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.trim().charAt(0);
  const lastInitial = lastName.trim().charAt(0);
  const fallback = `${firstInitial}${lastInitial}`.trim();

  if (fallback) {
    return fallback.toUpperCase();
  }

  return 'AC';
}

export function SettingsPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageUsers = hasPermission(auth.account?.permissions ?? [], accessPermissions.usersManage);
  const canManageGroups = hasPermission(auth.account?.permissions ?? [], accessPermissions.groupsManage);
  const canManageAccess = hasPermission(
    auth.account?.permissions ?? [],
    accessPermissions.accessControlManage,
  );
  const [isAdministrationOpen, setIsAdministrationOpen] = useState(true);
  const sections = useMemo(
    () =>
      [
        {
          key: 'account',
          label: 'Аккаунт',
          isVisible: true,
        },
      ].filter((section) => section.isVisible),
    [],
  );
  const sectionKeys = [
    ...sections.map((section) => section.key),
    ...(canManageUsers ? ['users'] : []),
    ...(canManageGroups ? ['group-access'] : []),
  ];
  const sectionFromSearch = searchParams.get('section');
  const activeSectionKey =
    sectionFromSearch && sectionKeys.includes(sectionFromSearch)
      ? sectionFromSearch
      : (sections[0]?.key ?? 'overview');

  const activeSection = sections.find((section) => section.key === activeSectionKey) ?? sections[0];
  const fullNameParts = splitFullName(auth.account?.user.fullName);
  const [firstName, setFirstName] = useState(fullNameParts.firstName);
  const [lastName, setLastName] = useState(fullNameParts.lastName);
  const [accountErrorMessage, setAccountErrorMessage] = useState<string | null>(null);
  const [isAccountSaving, setIsAccountSaving] = useState(false);

  function handleSectionChange(sectionKey: string) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('section', sectionKey);
    setSearchParams(nextSearchParams, { replace: true });
  }

  useEffect(() => {
    setFirstName(fullNameParts.firstName);
    setLastName(fullNameParts.lastName);
  }, [fullNameParts.firstName, fullNameParts.lastName]);

  async function handleAccountSave() {
    setAccountErrorMessage(null);
    setIsAccountSaving(true);

    try {
      const updatedAccount = await updateCurrentAccount({
        firstName,
        lastName,
      });
      auth.setCurrentAccount(updatedAccount);
    } catch (error) {
      setAccountErrorMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль');
    } finally {
      setIsAccountSaving(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Настройки"
        subtitle="Точка управления справочниками, составом групп и настройками доступа."
      />

      <div className="settings-layout">
        <aside className="settings-menu-panel">
          <nav className="settings-menu-list" aria-label="Settings sections">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`settings-menu-item${activeSectionKey === section.key ? ' settings-menu-item-active' : ''}`}
                onClick={() => handleSectionChange(section.key)}
              >
                <span className="settings-menu-label">{section.label}</span>
              </button>
            ))}
          </nav>

          {canManageUsers || canManageGroups || canManageAccess ? (
            <div className="settings-admin-block">
              <button
                type="button"
                className={`settings-admin-trigger${isAdministrationOpen ? ' settings-admin-trigger-open' : ''}`}
                onClick={() => setIsAdministrationOpen((current) => !current)}
              >
                <span className="settings-menu-label">Администрирование</span>
                <span
                  className={`settings-admin-trigger-icon${isAdministrationOpen ? ' settings-admin-trigger-icon-open' : ''}`}
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>

              {isAdministrationOpen ? (
                <div className="settings-admin-items">
                  {canManageUsers ? (
                    <button
                      type="button"
                      className={`settings-menu-item${activeSectionKey === 'users' ? ' settings-menu-item-active' : ''}`}
                      onClick={() => handleSectionChange('users')}
                    >
                      <span className="settings-menu-label">Пользователи</span>
                    </button>
                  ) : null}
                  {canManageGroups ? (
                    <button
                      type="button"
                      className={`settings-menu-item${activeSectionKey === 'group-access' ? ' settings-menu-item-active' : ''}`}
                      onClick={() => handleSectionChange('group-access')}
                    >
                      <span className="settings-menu-label">Группы</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>

        <section className="settings-content">
          {activeSectionKey === 'account' ? (
            <div className="content-card settings-account-root-card">
              <div className="settings-section-header">
                <h2>Аккаунт</h2>
              </div>

              <div className="settings-account-grid">
                <div className="content-card settings-account-profile-card">
                  <div className="section-heading">
                    <div>
                      <h2>Профиль</h2>
                    </div>
                  </div>

                  <div className="settings-profile-card-body">
                    <div className="settings-profile-avatar">
                      {getInitials(firstName, lastName)}
                    </div>

                    <div className="settings-profile-copy">
                      <div className="settings-profile-name">
                        {[firstName, lastName].filter(Boolean).join(' ').trim() || 'Аккаунт'}
                      </div>
                      <div className="settings-profile-email">{auth.account?.email ?? ''}</div>

                      <div className="settings-profile-badges">
                        <span className="settings-profile-badge">
                          {auth.account?.user.accessRole.name ?? 'Unknown'}
                        </span>
                        <span className="settings-profile-badge">
                          {auth.account?.user.groups.map((group) => group.name).join(', ') || 'Нет группы'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="content-card settings-account-form-card">
                  <div className="section-heading">
                    <div>
                      <h2>Редактировать профиль</h2>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="settings-account-fields-row">
                      <FormField htmlFor="account-first-name" label="Имя">
                        <Input
                          id="account-first-name"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                        />
                      </FormField>

                      <FormField htmlFor="account-last-name" label="Фамилия">
                        <Input
                          id="account-last-name"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                        />
                      </FormField>
                    </div>

                    <FormField htmlFor="account-email" label="Email">
                      <Input id="account-email" value={auth.account?.email ?? ''} disabled />
                    </FormField>

                    {accountErrorMessage ? (
                      <div className="form-inline-notice">{accountErrorMessage}</div>
                    ) : null}

                    <div className="settings-account-form-actions">
                      <Button type="button" onClick={() => void handleAccountSave()} disabled={isAccountSaving}>
                        {isAccountSaving ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSectionKey === 'group-access' ? (
            canManageGroups ? (
              <GroupsAdminPanel />
            ) : (
              <div className="content-card">
                <EmptyState
                  title="Groups management is unavailable"
                  message="У текущего аккаунта нет прав на изменение групп и состава отделов."
                />
              </div>
            )
          ) : null}

          {activeSectionKey === 'users' ? (
            canManageUsers ? (
              <UsersAdminPanel />
            ) : (
              <div className="content-card">
                <EmptyState
                  title="Users administration is unavailable"
                  message="У текущего аккаунта нет прав на создание ссылок регистрации."
                />
              </div>
            )
          ) : null}
        </section>
      </div>
    </div>
  );
}
