import { Module } from '@nestjs/common';

import { LicensesMetaController } from './controllers/licenses-meta.controller';
import { LicensesService } from './services/licenses.service';

@Module({
  controllers: [LicensesMetaController],
  providers: [LicensesService],
})
export class LicensesModule {}
