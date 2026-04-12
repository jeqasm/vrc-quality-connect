import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ActivityTypesController } from './controllers/activity-types.controller';
import { ActivityTypesRepository } from './repositories/activity-types.repository';
import { ListActivityTypesService } from './services/list-activity-types.service';

@Module({
  imports: [AuthModule],
  controllers: [ActivityTypesController],
  providers: [ActivityTypesRepository, ListActivityTypesService],
  exports: [ActivityTypesRepository],
})
export class ActivityTypesModule {}
