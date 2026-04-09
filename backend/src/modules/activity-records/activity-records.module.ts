import { Module } from '@nestjs/common';

import { ActivityRecordsController } from './controllers/activity-records.controller';
import { ActivityRecordMapper } from './mappers/activity-record.mapper';
import { ActivityRecordsRepository } from './repositories/activity-records.repository';
import { ActivityRecordsService } from './services/activity-records.service';

@Module({
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordMapper, ActivityRecordsRepository, ActivityRecordsService],
  exports: [ActivityRecordsRepository, ActivityRecordsService],
})
export class ActivityRecordsModule {}
