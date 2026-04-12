export type GroupPermission = {
  code: string;
  name: string;
  category: string;
};

export type GroupMember = {
  userId: string;
  fullName: string;
  email: string;
};

export type GroupItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  department: {
    id: string;
    code: string;
    name: string;
  } | null;
  members: GroupMember[];
  permissions: GroupPermission[];
};

export type AccessPermissionCatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
};
