import { Controller, Get } from '@nestjs/common';

@Controller('support-request-types')
export class SupportRequestTypesController {
  @Get('meta')
  getMeta() {
    return {
      module: 'support-request-types',
      implementationStatus: 'skeleton',
    };
  }
}

