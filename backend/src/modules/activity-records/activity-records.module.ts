import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ActivityRecordsController } from './controllers/activity-records.controller';
import { ActivityRecordMapper } from './mappers/activity-record.mapper';
import { ActivityRecordsRepository } from './repositories/activity-records.repository';
import { ActivityRecordsService } from './services/activity-records.service';

@Module({
  imports: [AuthModule],
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordMapper, ActivityRecordsRepository, ActivityRecordsService],
  exports: [ActivityRecordsRepository, ActivityRecordsService],
})
export class ActivityRecordsModule {}
