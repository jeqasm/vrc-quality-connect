import { GroupResponseDto } from '../dto/group-response.dto';
import { GroupEntity } from '../entities/group.entity';
import { GroupDetailsProjection } from '../repositories/groups.repository';

export class GroupMapper {
  static toEntity(group: GroupDetailsProjection): GroupEntity {
    return {
      id: group.id,
      code: group.code,
      name: group.name,
      description: group.description,
      type: group.type,
      isActive: group.isActive,
      department: group.department
        ? {
            id: group.department.id,
            code: group.department.code,
            name: group.department.name,
          }
        : null,
      members: group.memberships
        .map((membership) => ({
          userId: membership.user.id,
          fullName: membership.user.fullName,
          email: membership.user.email,
        }))
        .sort((left, right) => left.fullName.localeCompare(right.fullName)),
      permissions: group.permissionAssignments
        .map((assignment) => ({
          code: assignment.permission.code,
          name: assignment.permission.name,
          category: assignment.permission.category,
        }))
        .sort((left, right) => left.code.localeCompare(right.code)),
    };
  }

  static toResponse(entity: GroupEntity): GroupResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      isActive: entity.isActive,
      department: entity.department ? { ...entity.department } : null,
      members: entity.members.map((member) => ({ ...member })),
      permissions: entity.permissions.map((permission) => ({ ...permission })),
    };
  }
}
