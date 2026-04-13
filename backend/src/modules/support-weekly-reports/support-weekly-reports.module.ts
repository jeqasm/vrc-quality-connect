import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupportWeeklyReportsController } from './controllers/support-weekly-reports.controller';
import { SupportWeeklyReportsMapper } from './mappers/support-weekly-reports.mapper';
import { SupportWeeklyReportsRepository } from './repositories/support-weekly-reports.repository';
import { SupportWeeklyReportsService } from './services/support-weekly-reports.service';

@Module({
  imports: [AuthModule],
  controllers: [SupportWeeklyReportsController],
  providers: [
    SupportWeeklyReportsRepository,
    SupportWeeklyReportsMapper,
    SupportWeeklyReportsService,
  ],
})
export class SupportWeeklyReportsModule {}
