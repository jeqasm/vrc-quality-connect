type GroupDepartmentEntity = {
  id: string;
  code: string;
  name: string;
} | null;

type GroupMemberEntity = {
  userId: string;
  fullName: string;
  email: string;
};

type GroupPermissionEntity = {
  code: string;
  name: string;
  category: string;
};

export class GroupEntity {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  type!: string;
  isActive!: boolean;
  department!: GroupDepartmentEntity;
  members!: GroupMemberEntity[];
  permissions!: GroupPermissionEntity[];
}
