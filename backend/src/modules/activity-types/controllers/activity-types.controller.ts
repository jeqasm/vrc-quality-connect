import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ActivityTypeResponseDto } from '../dto/activity-type-response.dto';
import { ListActivityTypesService } from '../services/list-activity-types.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly listActivityTypesService: ListActivityTypesService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.activityRecordsView)
  findAll(): Promise<ActivityTypeResponseDto[]> {
    return this.listActivityTypesService.execute();
  }
}
