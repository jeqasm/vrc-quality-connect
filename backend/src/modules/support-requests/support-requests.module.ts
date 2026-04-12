import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupportRequestsController } from './controllers/support-requests.controller';
import { SupportRequestsRepository } from './repositories/support-requests.repository';
import { SupportRequestsService } from './services/support-requests.service';

@Module({
  imports: [AuthModule],
  controllers: [SupportRequestsController],
  providers: [SupportRequestsRepository, SupportRequestsService],
  exports: [SupportRequestsRepository, SupportRequestsService],
})
export class SupportRequestsModule {}
