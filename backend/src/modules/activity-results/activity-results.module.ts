import { Module } from '@nestjs/common';

import { ActivityResultsController } from './controllers/activity-results.controller';
import { ActivityResultsRepository } from './repositories/activity-results.repository';
import { ListActivityResultsService } from './services/list-activity-results.service';

@Module({
  controllers: [ActivityResultsController],
  providers: [ActivityResultsRepository, ListActivityResultsService],
  exports: [ActivityResultsRepository],
})
export class ActivityResultsModule {}
