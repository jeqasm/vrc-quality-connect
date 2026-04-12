import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LicensesMetaController } from './controllers/licenses-meta.controller';
import { LicensesRegistryController } from './controllers/licenses-registry.controller';
import { CsvLicenseRegistryParser } from './infrastructure/csv-license-registry.parser';
import { GoogleSheetsLicenseRegistryClient } from './infrastructure/google-sheets-license-registry.client';
import { LicenseRegistryRepository } from './repositories/license-registry.repository';
import { LicensesService } from './services/licenses.service';
import { RefreshLicenseRegistryService } from './services/refresh-license-registry.service';

@Module({
  imports: [AuthModule],
  controllers: [LicensesMetaController, LicensesRegistryController],
  providers: [
    LicensesService,
    RefreshLicenseRegistryService,
    GoogleSheetsLicenseRegistryClient,
    CsvLicenseRegistryParser,
    LicenseRegistryRepository,
  ],
})
export class LicensesModule {}
