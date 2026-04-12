import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AccessControlController } from './controllers/access-control.controller';
import { AccessControlCatalogRepository } from './repositories/access-control-catalog.repository';
import { AccessControlRepository } from './repositories/access-control.repository';
import { AccessControlCatalogService } from './services/access-control-catalog.service';
import { AccessControlService } from './services/access-control.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AccessControlController],
  providers: [
    AccessControlCatalogRepository,
    AccessControlCatalogService,
    AccessControlRepository,
    AccessControlService,
  ],
  exports: [AccessControlRepository, AccessControlService, AccessControlCatalogService],
})
export class AccessControlModule {}
