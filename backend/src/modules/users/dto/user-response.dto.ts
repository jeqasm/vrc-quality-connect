class UserDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class UserAccessRoleDto {
  code!: string;
  name!: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  accessRole!: UserAccessRoleDto;
  department!: UserDepartmentDto;
}
