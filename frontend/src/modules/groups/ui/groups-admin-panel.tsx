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

function groupPermissionsByCategory(
  permissions: AccessPermissionCatalogItem[],
): Array<[string, AccessPermissionCatalogItem[]]> {
  const map = new Map<string, AccessPermissionCatalogItem[]>();

  for (const permission of permissions) {
    const currentCategory = map.get(permission.category) ?? [];
    currentCategory.push(permission);
    map.set(permission.category, currentCategory);
  }

  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right));
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
    () => groupPermissionsByCategory(permissionsQuery.data ?? []),
    [permissionsQuery.data],
  );
  const selectedGroup = (groupsQuery.data ?? []).find((group) => group.id === selectedGroupId) ?? null;

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
    onSuccess: async () => {
      setSelectedUserId('');
      setMemberErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      setMemberErrorMessage(error instanceof Error ? error.message : 'Failed to assign member');
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

    assignPermissionsMutation.mutate({
      groupId: selectedGroupId,
      permissionCodes: selectedPermissionCodes,
    });
  }

  function handleGroupSelection(groupId: string) {
    setSelectedGroupId(groupId);
    const nextGroup = (groupsQuery.data ?? []).find((group) => group.id === groupId);
    setSelectedPermissionCodes(nextGroup?.permissions.map((permission) => permission.code) ?? []);
    setMemberErrorMessage(null);
    setPermissionsErrorMessage(null);
    setSelectedUserId('');
    setIsManageGroupModalOpen(true);
  }

  function togglePermission(permissionCode: string) {
    setSelectedPermissionCodes((current) =>
      current.includes(permissionCode)
        ? current.filter((item) => item !== permissionCode)
        : [...current, permissionCode],
    );
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
                  <h2>Members</h2>
                  <p className="card-subtitle">{selectedGroup.name}</p>
                </div>
              </div>

              <form className="actions-row" onSubmit={handleAssignMember}>
                <select
                  className="field-select"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  <option value="">Select user</option>
                  {(usersQuery.data ?? []).map((user: UserOption) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} | {user.department.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" disabled={assignMemberMutation.isPending}>
                  {assignMemberMutation.isPending ? 'Adding...' : 'Add member'}
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
                  <h2>Permissions</h2>
                  <p className="card-subtitle">Назначение прав происходит на всю группу.</p>
                </div>
                <Button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={assignPermissionsMutation.isPending}
                >
                  {assignPermissionsMutation.isPending ? 'Saving...' : 'Save permissions'}
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
                            <strong>{permission.name}</strong>
                            <span className="muted-text"> {permission.code}</span>
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
