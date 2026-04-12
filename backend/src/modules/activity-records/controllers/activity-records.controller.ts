import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ActivityRecordResponseDto } from '../dto/activity-record-response.dto';
import { CreateActivityRecordDto } from '../dto/create-activity-record.dto';
import { QueryActivityRecordsDto } from '../dto/query-activity-records.dto';
import { ActivityRecordsService } from '../services/activity-records.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('activity-records')
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  @Post()
  @RequirePermissions(accessPermissionCodes.activityRecordsCreate)
  create(@Body() dto: CreateActivityRecordDto): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.create(dto);
  }

  @Get()
  @RequirePermissions(accessPermissionCodes.activityRecordsView)
  findMany(@Query() filters: QueryActivityRecordsDto): Promise<ActivityRecordResponseDto[]> {
    return this.activityRecordsService.findMany(filters);
  }

  @Get(':id')
  @RequirePermissions(accessPermissionCodes.activityRecordsView)
  findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.findById(id);
  }
}
