import { Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { AssignGroupMemberDto } from '../dto/assign-group-member.dto';
import { AssignGroupPermissionsDto } from '../dto/assign-group-permissions.dto';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GroupResponseDto } from '../dto/group-response.dto';
import { GroupMapper } from '../mappers/group.mapper';
import { GroupsRepository } from '../repositories/groups.repository';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async findMany(): Promise<GroupResponseDto[]> {
    const groups = await this.groupsRepository.findMany();
    return groups.map((group) => GroupMapper.toResponse(GroupMapper.toEntity(group)));
  }

  async create(dto: CreateGroupDto): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      departmentId: dto.departmentId,
    });

    if (dto.permissionCodes?.length) {
      await this.assignPermissions(group.id, {
        permissionCodes: dto.permissionCodes,
      });
      const updatedGroup = await this.requireGroup(group.id);
      return GroupMapper.toResponse(GroupMapper.toEntity(updatedGroup));
    }

    return GroupMapper.toResponse(GroupMapper.toEntity(group));
  }

  async assignMember(groupId: string, dto: AssignGroupMemberDto): Promise<GroupResponseDto> {
    await this.requireGroup(groupId);

    const user = await this.groupsRepository.findUserById(dto.userId);

    if (!user) {
      throw new ApplicationNotFoundError('User', `id=${dto.userId}`);
    }

    await this.groupsRepository.assignMember(groupId, dto.userId);

    const group = await this.requireGroup(groupId);
    return GroupMapper.toResponse(GroupMapper.toEntity(group));
  }

  async assignPermissions(
    groupId: string,
    dto: AssignGroupPermissionsDto,
  ): Promise<GroupResponseDto> {
    await this.requireGroup(groupId);

    const permissionRows = await this.groupsRepository.findPermissionIdsByCodes(dto.permissionCodes);
    const permissionIdByCode = new Map(permissionRows.map((row) => [row.code, row.id]));
    const missingCodes = dto.permissionCodes.filter((code) => !permissionIdByCode.has(code));

    if (missingCodes.length > 0) {
      throw new ApplicationNotFoundError('Access permissions', `codes=${missingCodes.join(',')}`);
    }

    await this.groupsRepository.replacePermissions(groupId, dto.permissionCodes.map((code) => permissionIdByCode.get(code)!));

    const group = await this.requireGroup(groupId);
    return GroupMapper.toResponse(GroupMapper.toEntity(group));
  }

  private async requireGroup(groupId: string) {
    const group = await this.groupsRepository.findById(groupId);

    if (!group) {
      throw new ApplicationNotFoundError('Group', `id=${groupId}`);
    }

    return group;
  }
}
