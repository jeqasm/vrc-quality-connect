import { apiClient } from '../../../shared/api/api-client';
import { AccessPermissionCatalogItem, GroupItem } from '../model/group';

export type CreateGroupRequest = {
  code: string;
  name: string;
  description?: string;
  type: string;
  departmentId?: string;
  permissionCodes?: string[];
};

export function getGroups(): Promise<GroupItem[]> {
  return apiClient<GroupItem[]>('/groups');
}

export function createGroup(request: CreateGroupRequest): Promise<GroupItem> {
  return apiClient<GroupItem>('/groups', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function assignGroupMember(groupId: string, userId: string): Promise<GroupItem> {
  return apiClient<GroupItem>(`/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function assignGroupPermissions(groupId: string, permissionCodes: string[]): Promise<GroupItem> {
  return apiClient<GroupItem>(`/groups/${groupId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permissionCodes }),
  });
}

export function getAccessPermissions(): Promise<AccessPermissionCatalogItem[]> {
  return apiClient<AccessPermissionCatalogItem[]>('/access-control/permissions');
}
