import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LicenseTypesController } from './controllers/license-types.controller';
import { LicenseTypesRepository } from './repositories/license-types.repository';
import { LicenseTypesService } from './services/license-types.service';

@Module({
  imports: [AuthModule],
  controllers: [LicenseTypesController],
  providers: [LicenseTypesRepository, LicenseTypesService],
  exports: [LicenseTypesService],
})
export class LicenseTypesModule {}
