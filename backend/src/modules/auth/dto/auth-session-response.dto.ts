export class AuthSessionResponseDto {
  accessToken!: string;
  expiresAt!: string;
  account!: CurrentAccountResponseDto;
}

class CurrentAccountDepartmentResponseDto {
  id!: string;
  code!: string;
  name!: string;
}

class CurrentAccountRoleResponseDto {
  code!: string;
  name!: string;
}

class CurrentAccountGroupResponseDto {
  id!: string;
  code!: string;
  name!: string;
  type!: string;
}

class CurrentAccountUserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  department!: CurrentAccountDepartmentResponseDto;
  accessRole!: CurrentAccountRoleResponseDto;
  groups!: CurrentAccountGroupResponseDto[];
}

export class CurrentAccountResponseDto {
  accountId!: string;
  email!: string;
  status!: string;
  user!: CurrentAccountUserResponseDto;
  permissions!: string[];
}
