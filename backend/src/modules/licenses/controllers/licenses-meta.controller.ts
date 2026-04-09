import { Controller, Get } from '@nestjs/common';

@Controller('licenses')
export class LicensesMetaController {
  @Get('meta')
  getMeta() {
    return {
      module: 'licenses',
      implementationStatus: 'skeleton',
    };
  }
}

