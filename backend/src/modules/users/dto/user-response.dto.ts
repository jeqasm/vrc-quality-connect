class UserDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: string;
  department!: UserDepartmentDto;
}
