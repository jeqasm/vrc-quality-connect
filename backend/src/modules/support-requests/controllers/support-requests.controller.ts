import { Controller, Get, UseGuards } from '@nestjs/common';

import { accessPermissionCodes } from '../../access-control/constants/access-permission-codes';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthSessionGuard } from '../../auth/guards/auth-session.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { SupportRequestsService } from '../services/support-requests.service';

@UseGuards(AuthSessionGuard, PermissionsGuard)
@Controller('support-requests')
export class SupportRequestsController {
  constructor(
    private readonly supportRequestsService: SupportRequestsService,
  ) {}

  @Get()
  @RequirePermissions(accessPermissionCodes.supportRequestsView)
  getMeta() {
    return this.supportRequestsService.getMeta();
  }
}
