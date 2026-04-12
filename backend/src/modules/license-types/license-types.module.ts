import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LicenseTypesController } from './controllers/license-types.controller';

@Module({
  imports: [AuthModule],
  controllers: [LicenseTypesController],
})
export class LicenseTypesModule {}
