import { Module } from '@nestjs/common';

import { SupportRequestTypesController } from './controllers/support-request-types.controller';

@Module({
  controllers: [SupportRequestTypesController],
})
export class SupportRequestTypesModule {}

