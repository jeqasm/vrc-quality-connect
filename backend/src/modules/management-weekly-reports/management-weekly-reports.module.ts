import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ManagementWeeklyReportsController } from './controllers/management-weekly-reports.controller';
import { ManagementWeeklyReportsMapper } from './mappers/management-weekly-reports.mapper';
import { ManagementWeeklyReportsRepository } from './repositories/management-weekly-reports.repository';
import { ManagementWeeklyReportsService } from './services/management-weekly-reports.service';

@Module({
  imports: [AuthModule],
  controllers: [ManagementWeeklyReportsController],
  providers: [
    ManagementWeeklyReportsRepository,
    ManagementWeeklyReportsMapper,
    ManagementWeeklyReportsService,
  ],
})
export class ManagementWeeklyReportsModule {}
