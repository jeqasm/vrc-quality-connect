import { Controller, Get } from '@nestjs/common';

import { SupportRequestsService } from '../services/support-requests.service';

@Controller('support-requests')
export class SupportRequestsController {
  constructor(
    private readonly supportRequestsService: SupportRequestsService,
  ) {}

  @Get()
  getMeta() {
    return this.supportRequestsService.getMeta();
  }
}
