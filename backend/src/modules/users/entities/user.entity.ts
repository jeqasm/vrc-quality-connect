class UserDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

class UserAccessRoleEntity {
  code!: string;
  name!: string;
}

export class UserEntity {
  id!: string;
  email!: string;
  fullName!: string;
  accessRole!: UserAccessRoleEntity;
  department!: UserDepartmentEntity;
}
