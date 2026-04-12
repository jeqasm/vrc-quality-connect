import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { QaWeeklyReportsController } from './controllers/qa-weekly-reports.controller';
import { QaWeeklyReportsMapper } from './mappers/qa-weekly-reports.mapper';
import { QaWeeklyReportsRepository } from './repositories/qa-weekly-reports.repository';
import { QaWeeklyReportsService } from './services/qa-weekly-reports.service';

@Module({
  imports: [AuthModule],
  controllers: [QaWeeklyReportsController],
  providers: [QaWeeklyReportsRepository, QaWeeklyReportsMapper, QaWeeklyReportsService],
  exports: [QaWeeklyReportsRepository, QaWeeklyReportsService],
})
export class QaWeeklyReportsModule {}
