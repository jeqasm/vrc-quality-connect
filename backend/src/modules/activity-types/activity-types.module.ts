import { Module } from '@nestjs/common';

import { ActivityTypesController } from './controllers/activity-types.controller';
import { ActivityTypesRepository } from './repositories/activity-types.repository';
import { ListActivityTypesService } from './services/list-activity-types.service';

@Module({
  controllers: [ActivityTypesController],
  providers: [ActivityTypesRepository, ListActivityTypesService],
  exports: [ActivityTypesRepository],
})
export class ActivityTypesModule {}

