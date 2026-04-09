import { Module } from '@nestjs/common';

import { SupportRequestsController } from './controllers/support-requests.controller';
import { SupportRequestsRepository } from './repositories/support-requests.repository';
import { SupportRequestsService } from './services/support-requests.service';

@Module({
  controllers: [SupportRequestsController],
  providers: [SupportRequestsRepository, SupportRequestsService],
  exports: [SupportRequestsRepository, SupportRequestsService],
})
export class SupportRequestsModule {}

