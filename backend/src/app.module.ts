import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { CoreModule } from './core/core.module';
import { ActivityResultsModule } from './modules/activity-results/activity-results.module';
import { ActivityRecordsModule } from './modules/activity-records/activity-records.module';
import { ActivityTypesModule } from './modules/activity-types/activity-types.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { LicenseTypesModule } from './modules/license-types/license-types.module';
import { QaWeeklyReportsModule } from './modules/qa-weekly-reports/qa-weekly-reports.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SupportRequestsModule } from './modules/support-requests/support-requests.module';
import { SupportRequestTypesModule } from './modules/support-request-types/support-request-types.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    CoreModule,
    PrismaModule,
    UsersModule,
    DepartmentsModule,
    ActivityTypesModule,
    ActivityResultsModule,
    ActivityRecordsModule,
    SupportRequestsModule,
    SupportRequestTypesModule,
    ReportsModule,
    QaWeeklyReportsModule,
    LicensesModule,
    LicenseTypesModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
