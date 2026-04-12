import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LicenseTypesModule } from '../license-types/license-types.module';
import { LicensesMetaController } from './controllers/licenses-meta.controller';
import { LicensesRegistryController } from './controllers/licenses-registry.controller';
import { CsvLicenseRegistryParser } from './infrastructure/csv-license-registry.parser';
import { GoogleSheetsLicenseRegistryClient } from './infrastructure/google-sheets-license-registry.client';
import { LicenseRegistryRepository } from './repositories/license-registry.repository';
import { LicenseRegistryRecordsRepository } from './repositories/license-registry-records.repository';
import { LicenseRegistryRecordsService } from './services/license-registry-records.service';
import { LicensesService } from './services/licenses.service';
import { RefreshLicenseRegistryService } from './services/refresh-license-registry.service';

@Module({
  imports: [AuthModule, LicenseTypesModule],
  controllers: [LicensesMetaController, LicensesRegistryController],
  providers: [
    LicensesService,
    LicenseRegistryRecordsService,
    RefreshLicenseRegistryService,
    GoogleSheetsLicenseRegistryClient,
    CsvLicenseRegistryParser,
    LicenseRegistryRepository,
    LicenseRegistryRecordsRepository,
  ],
})
export class LicensesModule {}
