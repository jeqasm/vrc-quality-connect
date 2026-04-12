import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ActivityResultResponseDto } from '../dto/activity-result-response.dto';
import { ListActivityResultsService } from '../services/list-activity-results.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('activity-results')
export class ActivityResultsController {
  constructor(private readonly listActivityResultsService: ListActivityResultsService) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.activityRecordsView)
  findAll(): Promise<ActivityResultResponseDto[]> {
    return this.listActivityResultsService.execute();
  }
}
