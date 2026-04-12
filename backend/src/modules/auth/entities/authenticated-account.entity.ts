type AuthenticatedDepartmentEntity = {
  id: string;
  code: string;
  name: string;
};

type AuthenticatedRoleEntity = {
  code: string;
  name: string;
};

type AuthenticatedGroupEntity = {
  id: string;
  code: string;
  name: string;
  type: string;
};

type AuthenticatedUserEntity = {
  id: string;
  email: string;
  fullName: string;
  department: AuthenticatedDepartmentEntity;
  accessRole: AuthenticatedRoleEntity;
  groups: AuthenticatedGroupEntity[];
};

export class AuthenticatedAccountEntity {
  accountId!: string;
  email!: string;
  status!: string;
  user!: AuthenticatedUserEntity;
  permissions!: string[];
}
