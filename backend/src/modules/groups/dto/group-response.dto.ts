class GroupDepartmentResponseDto {
  id!: string;
  code!: string;
  name!: string;
}

class GroupMemberResponseDto {
  userId!: string;
  fullName!: string;
  email!: string;
}

class GroupPermissionResponseDto {
  code!: string;
  name!: string;
  category!: string;
}

export class GroupResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  type!: string;
  isActive!: boolean;
  department!: GroupDepartmentResponseDto | null;
  members!: GroupMemberResponseDto[];
  permissions!: GroupPermissionResponseDto[];
}
