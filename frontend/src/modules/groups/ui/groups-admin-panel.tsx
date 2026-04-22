import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';

import { getUsers } from '../../reference-data/api/reference-data-api';
import { UserOption } from '../../reference-data/model/reference-data';
import {
  assignGroupMember,
  assignGroupPermissions,
  createGroup,
  getAccessPermissions,
  getGroups,
} from '../api/groups-api';
import { AccessPermissionCatalogItem, GroupItem } from '../model/group';
import { Button } from '../../../shared/ui/button/button';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';
import { Modal } from '../../../shared/ui/modal/modal';
import { Textarea } from '../../../shared/ui/textarea/textarea';
import { ApiError } from '../../../shared/api/api-client';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return `${fallbackMessage} (HTTP ${error.status}): ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

type PermissionUiMeta = {
  section: 'navigation' | 'operations' | 'activityTabs' | 'reportTabs' | 'administration';
  sectionTitle: string;
  sectionOrder: number;
  title: string;
  description: string;
  order: number;
};

const permissionUiMetaByCode: Record<string, PermissionUiMeta> = {
  'dashboard.view': {
    section: 'navigation',
    sectionTitle: 'Навигация',
    sectionOrder: 1,
    title: 'Главная',
    description: 'Показывает страницу Dashboard и пункт меню.',
    order: 10,
  },
  'activity-records.view': {
    section: 'navigation',
    sectionTitle: 'Навигация',
    sectionOrder: 1,
    title: 'Учет активности',
    description: 'Показывает страницу Activity records и пункт меню.',
    order: 20,
  },
  'reports.view': {
    section: 'navigation',
    sectionTitle: 'Навигация',
    sectionOrder: 1,
    title: 'Отчеты',
    description: 'Показывает страницу Reports и пункт меню.',
    order: 30,
  },
  'support-requests.view': {
    section: 'navigation',
    sectionTitle: 'Навигация',
    sectionOrder: 1,
    title: 'Поддержка',
    description: 'Показывает страницу Support requests и пункт меню.',
    order: 40,
  },
  'activity-records.create': {
    section: 'operations',
    sectionTitle: 'Операции',
    sectionOrder: 2,
    title: 'Создание записей активности',
    description: 'Разрешает создавать activity records через API/UI.',
    order: 10,
  },
  'licenses.view': {
    section: 'activityTabs',
    sectionTitle: 'Вкладки учета активности',
    sectionOrder: 3,
    title: 'Лицензии',
    description: 'Показывает вкладку «Лицензии» в учете активности и дает доступ к license workspace.',
    order: 10,
  },
  'activity-records.qa.view': {
    section: 'activityTabs',
    sectionTitle: 'Вкладки учета активности',
    sectionOrder: 3,
    title: 'QA / Testing',
    description: 'Показывает QA-вкладку в «Учете активности».',
    order: 20,
  },
  'activity-records.support.view': {
    section: 'activityTabs',
    sectionTitle: 'Вкладки учета активности',
    sectionOrder: 3,
    title: 'Technical Support',
    description: 'Показывает Technical Support-вкладку в «Учете активности».',
    order: 30,
  },
  'activity-records.management.view': {
    section: 'activityTabs',
    sectionTitle: 'Вкладки учета активности',
    sectionOrder: 3,
    title: 'Management',
    description: 'Показывает Management-вкладку в «Учете активности».',
    order: 40,
  },
  'reports.qa.view': {
    section: 'reportTabs',
    sectionTitle: 'Вкладки отчетов',
    sectionOrder: 4,
    title: 'QA / Testing',
    description: 'Показывает QA-вкладку в разделе «Отчеты».',
    order: 10,
  },
  'reports.licenses.view': {
    section: 'reportTabs',
    sectionTitle: 'Вкладки отчетов',
    sectionOrder: 4,
    title: 'Лицензии',
    description: 'Показывает вкладку «Лицензии» в разделе «Отчеты».',
    order: 20,
  },
  'reports.support.view': {
    section: 'reportTabs',
    sectionTitle: 'Вкладки отчетов',
    sectionOrder: 4,
    title: 'Technical Support',
    description: 'Показывает Technical Support-вкладку в разделе «Отчеты».',
    order: 30,
  },
  'reports.management.view': {
    section: 'reportTabs',
    sectionTitle: 'Вкладки отчетов',
    sectionOrder: 4,
    title: 'Management',
    description: 'Показывает Management-вкладку в разделе «Отчеты».',
    order: 40,
  },
  'users.manage': {
    section: 'administration',
    sectionTitle: 'Администрирование',
    sectionOrder: 5,
    title: 'Управление пользователями',
    description: 'Доступ к разделу Users в Settings.',
    order: 10,
  },
  'groups.manage': {
    section: 'administration',
    sectionTitle: 'Администрирование',
    sectionOrder: 5,
    title: 'Управление группами',
    description: 'Доступ к разделу Groups в Settings.',
    order: 20,
  },
};

const permissionDependenciesByCode: Record<string, string[]> = {
  'activity-records.qa.view': ['activity-records.view'],
  'activity-records.support.view': ['activity-records.view'],
  'activity-records.management.view': ['activity-records.view'],
  'reports.qa.view': ['reports.view'],
  'reports.licenses.view': ['reports.view'],
  'reports.support.view': ['reports.view'],
  'reports.management.view': ['reports.view'],
  'licenses.view': ['activity-records.view'],
};

type PermissionViewItem = AccessPermissionCatalogItem & {
  uiTitle: string;
  uiDescription: string;
  sectionTitle: string;
  sectionOrder: number;
  order: number;
};

function withRequiredPermissions(permissionCodes: string[]): string[] {
  const expanded = new Set(permissionCodes);
  let updated = true;

  while (updated) {
    updated = false;

    for (const code of Array.from(expanded)) {
      for (const requiredCode of permissionDependenciesByCode[code] ?? []) {
        if (!expanded.has(requiredCode)) {
          expanded.add(requiredCode);
          updated = true;
        }
      }
    }
  }

  return Array.from(expanded);
}

function buildPermissionSections(
  permissions: AccessPermissionCatalogItem[],
): Array<[string, PermissionViewItem[]]> {
  const map = new Map<string, PermissionViewItem[]>();

  for (const permission of permissions) {
    const uiMeta = permissionUiMetaByCode[permission.code];

    if (!uiMeta) {
      continue;
    }

    const entry: PermissionViewItem = {
      ...permission,
      uiTitle: uiMeta.title,
      uiDescription: uiMeta.description,
      sectionTitle: uiMeta.sectionTitle,
      sectionOrder: uiMeta.sectionOrder,
      order: uiMeta.order,
    };

    const current = map.get(uiMeta.sectionTitle) ?? [];
    current.push(entry);
    map.set(uiMeta.sectionTitle, current);
  }

  return [...map.entries()]
    .map(([section, sectionPermissions]) => [
      section,
      sectionPermissions.sort((left, right) => left.order - right.order),
    ] as [string, PermissionViewItem[]])
    .sort((left, right) => left[1][0].sectionOrder - right[1][0].sectionOrder);
}

export function GroupsAdminPanel() {
  const queryClient = useQueryClient();
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>(null);
  const [permissionsErrorMessage, setPermissionsErrorMessage] = useState<string | null>(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isManageGroupModalOpen, setIsManageGroupModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    description: '',
    type: 'department',
  });
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  const permissionsQuery = useQuery({
    queryKey: ['access-control', 'permissions'],
    queryFn: getAccessPermissions,
  });

  const groupedPermissions = useMemo(
    () => buildPermissionSections(permissionsQuery.data ?? []),
    [permissionsQuery.data],
  );
  const selectedGroup = (groupsQuery.data ?? []).find((group) => group.id === selectedGroupId) ?? null;
  const selectableUsers = useMemo(() => {
    if (!selectedGroup) {
      return usersQuery.data ?? [];
    }

    const memberIds = new Set(selectedGroup.members.map((member) => member.userId));
    return (usersQuery.data ?? []).filter((user) => !memberIds.has(user.id));
  }, [selectedGroup, usersQuery.data]);

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: async (group) => {
      setFormState({
        code: '',
        name: '',
        description: '',
        type: 'department',
      });
      setSelectedGroupId(group.id);
      setCreateErrorMessage(null);
      setIsCreateGroupModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      setCreateErrorMessage(error instanceof Error ? error.message : 'Failed to create group');
    },
  });

  const assignMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      assignGroupMember(groupId, userId),
    onSuccess: async (updatedGroup) => {
      setSelectedUserId('');
      setMemberErrorMessage(null);
      queryClient.setQueryData<GroupItem[]>(['groups'], (currentGroups) => {
        if (!currentGroups) {
          return currentGroups;
        }

        return currentGroups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group));
      });
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      setMemberErrorMessage(getErrorMessage(error, 'Failed to assign member'));
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: ({ groupId, permissionCodes }: { groupId: string; permissionCodes: string[] }) =>
      assignGroupPermissions(groupId, permissionCodes),
    onSuccess: async () => {
      setPermissionsErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      setPermissionsErrorMessage(error instanceof Error ? error.message : 'Failed to save permissions');
    },
  });

  function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createGroupMutation.mutate({
      code: formState.code.trim(),
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      type: formState.type,
    });
  }

  function handleAssignMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGroupId || !selectedUserId) {
      setMemberErrorMessage('Select both a group and a user.');
      return;
    }

    if (selectedGroup?.members.some((member) => member.userId === selectedUserId)) {
      setMemberErrorMessage('Selected user is already a member of this group.');
      return;
    }

    assignMemberMutation.mutate({
      groupId: selectedGroupId,
      userId: selectedUserId,
    });
  }

  function handleSavePermissions() {
    if (!selectedGroupId) {
      setPermissionsErrorMessage('Select a group first.');
      return;
    }

    const permissionCodes = withRequiredPermissions(selectedPermissionCodes);
    setSelectedPermissionCodes(permissionCodes);

    assignPermissionsMutation.mutate({
      groupId: selectedGroupId,
      permissionCodes,
    });
  }

  function handleGroupSelection(groupId: string) {
    setSelectedGroupId(groupId);
    const nextGroup = (groupsQuery.data ?? []).find((group) => group.id === groupId);
    setSelectedPermissionCodes(
      withRequiredPermissions(nextGroup?.permissions.map((permission) => permission.code) ?? []),
    );
    setMemberErrorMessage(null);
    setPermissionsErrorMessage(null);
    setSelectedUserId('');
    void queryClient.invalidateQueries({ queryKey: ['users'] });
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
    setIsManageGroupModalOpen(true);
  }

  function togglePermission(permissionCode: string) {
    setSelectedPermissionCodes((current) => {
      if (current.includes(permissionCode)) {
        return current.filter((item) => item !== permissionCode);
      }

      return withRequiredPermissions([...current, permissionCode]);
    });
  }

  return (
    <div className="page-grid">
      <div className="page-grid groups-admin-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Группы</h2>
            </div>
            <Button type="button" onClick={() => setIsCreateGroupModalOpen(true)}>
              Создать группу
            </Button>
          </div>

          <div className="stack-md">
            {(groupsQuery.data ?? []).map((group: GroupItem) => (
              <article
                key={group.id}
                className={`group-summary-card${selectedGroupId === group.id ? ' group-summary-card-active' : ''}`}
              >
                <div className="group-summary-head">
                  <div className="group-summary-copy">
                    <strong>{group.name}</strong>
                  </div>
                  <div className="group-summary-head-actions">
                    <button
                      type="button"
                      className="icon-button group-settings-button"
                      onClick={() => handleGroupSelection(group.id)}
                      aria-label={`Настройки группы ${group.name}`}
                      title="Настройки"
                    >
                      ⚙
                    </button>
                  </div>
                </div>

                <div className="group-summary-meta">
                  <span>Сотрудников: {group.members.length}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Modal
        isOpen={isCreateGroupModalOpen}
        title="Создать группу"
        description="Новая группа используется как организационный контейнер для сотрудников и назначения прав."
        onClose={() => {
          if (createGroupMutation.isPending) {
            return;
          }

          setIsCreateGroupModalOpen(false);
          setCreateErrorMessage(null);
        }}
      >
        <form className="form-grid" onSubmit={handleCreateGroup}>
          <FormField htmlFor="group-name" label="Название">
            <Input
              id="group-name"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="QA / Testing"
              required
            />
          </FormField>

          <FormField htmlFor="group-code" label="Код">
            <Input
              id="group-code"
              value={formState.code}
              onChange={(event) => setFormState((current) => ({ ...current, code: event.target.value }))}
              placeholder="department-qa-testing"
              required
            />
          </FormField>

          <FormField htmlFor="group-description" label="Описание">
            <Textarea
              id="group-description"
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({ ...current, description: event.target.value }))
              }
              className="compact-textarea"
            />
          </FormField>

          {createErrorMessage ? <div className="form-inline-notice">{createErrorMessage}</div> : null}

          <div className="actions-row">
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creating...' : 'Create group'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={createGroupMutation.isPending}
              onClick={() => {
                setIsCreateGroupModalOpen(false);
                setCreateErrorMessage(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedGroup && isManageGroupModalOpen)}
        title={selectedGroup ? `Управление: ${selectedGroup.name}` : 'Управление группой'}
        description="Здесь настраиваются состав группы и назначенные ей права."
        onClose={() => {
          if (assignMemberMutation.isPending || assignPermissionsMutation.isPending) {
            return;
          }

          setIsManageGroupModalOpen(false);
          setMemberErrorMessage(null);
          setPermissionsErrorMessage(null);
        }}
      >
        {selectedGroup ? (
          <div className="two-column-grid groups-manage-grid">
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Участники</h2>
                  <p className="card-subtitle">{selectedGroup.name}</p>
                </div>
              </div>

              <form className="actions-row" onSubmit={handleAssignMember}>
                <select
                  className="field-select"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  required
                >
                  <option value="">Выбери пользователя</option>
                  {selectableUsers.map((user: UserOption) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} | {user.department.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" disabled={assignMemberMutation.isPending || !selectedUserId}>
                  {assignMemberMutation.isPending ? 'Добавление...' : 'Добавить в группу'}
                </Button>
              </form>

              {memberErrorMessage ? <div className="form-inline-notice">{memberErrorMessage}</div> : null}

              <div className="stack-md">
                {selectedGroup.members.map((member) => (
                  <div key={member.userId} className="list-item">
                    <strong>{member.fullName}</strong>
                    <div className="muted-text">{member.email}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Права</h2>
                  <p className="card-subtitle">
                    Права ниже соответствуют реальным разделам интерфейса. Часть базовых прав
                    добавляется автоматически.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={assignPermissionsMutation.isPending}
                >
                  {assignPermissionsMutation.isPending ? 'Сохранение...' : 'Сохранить права'}
                </Button>
              </div>

              {permissionsErrorMessage ? (
                <div className="form-inline-notice">{permissionsErrorMessage}</div>
              ) : null}

              <div className="stack-md">
                {groupedPermissions.map(([category, permissions]) => (
                  <section key={category} className="permission-category-card">
                    <div className="permission-category-title">{category}</div>
                    <div className="stack-md">
                      {permissions.map((permission) => (
                        <label key={permission.code} className="permission-toggle-row">
                          <input
                            type="checkbox"
                            checked={selectedPermissionCodes.includes(permission.code)}
                            onChange={() => togglePermission(permission.code)}
                          />
                          <span>
                            <strong>{permission.uiTitle}</strong>
                            <span className="muted-text"> {permission.code}</span>
                            <div className="muted-text">{permission.uiDescription}</div>
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
