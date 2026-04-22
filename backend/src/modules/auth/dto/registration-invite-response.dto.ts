class RegistrationInviteDepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

class RegistrationInviteRoleDto {
  code!: string;
  name!: string;
}

export class RegistrationInviteResponseDto {
  id!: string;
  email!: string | null;
  firstName!: string | null;
  lastName!: string | null;
  expiresAt!: string;
  usedAt!: string | null;
  createdAt!: string;
  department!: RegistrationInviteDepartmentDto;
  accessRole!: RegistrationInviteRoleDto;
}

export class CreatedRegistrationInviteResponseDto extends RegistrationInviteResponseDto {
  inviteToken!: string;
}

export class RegistrationInvitePublicInfoDto {
  email!: string | null;
  firstName!: string | null;
  lastName!: string | null;
  expiresAt!: string;
  department!: RegistrationInviteDepartmentDto;
  accessRole!: RegistrationInviteRoleDto;
}
