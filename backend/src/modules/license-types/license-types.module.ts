import { Module } from '@nestjs/common';

import { LicenseTypesController } from './controllers/license-types.controller';

@Module({
  controllers: [LicenseTypesController],
})
export class LicenseTypesModule {}

