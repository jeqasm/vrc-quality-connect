class UserDepartmentEntity {
  id!: string;
  code!: string;
  name!: string;
}

export class UserEntity {
  id!: string;
  email!: string;
  fullName!: string;
  role!: string;
  department!: UserDepartmentEntity;
}
