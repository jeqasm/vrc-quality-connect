import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupportRequestTypesController } from './controllers/support-request-types.controller';

@Module({
  imports: [AuthModule],
  controllers: [SupportRequestTypesController],
})
export class SupportRequestTypesModule {}
