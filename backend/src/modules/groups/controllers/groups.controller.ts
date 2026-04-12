import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { CurrentAccount } from '../../auth/decorators/current-account.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedAccountEntity } from '../../auth/entities/authenticated-account.entity';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { AssignGroupMemberDto } from '../dto/assign-group-member.dto';
import { AssignGroupPermissionsDto } from '../dto/assign-group-permissions.dto';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GroupResponseDto } from '../dto/group-response.dto';
import { GroupsService } from '../services/groups.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@RequirePermissions(accessPermissionCodes.groupsManage)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findMany(@CurrentAccount() _currentAccount: AuthenticatedAccountEntity): Promise<GroupResponseDto[]> {
    return this.groupsService.findMany();
  }

  @Post()
  create(@Body() dto: CreateGroupDto): Promise<GroupResponseDto> {
    return this.groupsService.create(dto);
  }

  @Post(':groupId/members')
  assignMember(
    @Param('groupId') groupId: string,
    @Body() dto: AssignGroupMemberDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.assignMember(groupId, dto);
  }

  @Post(':groupId/permissions')
  assignPermissions(
    @Param('groupId') groupId: string,
    @Body() dto: AssignGroupPermissionsDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.assignPermissions(groupId, dto);
  }
}
