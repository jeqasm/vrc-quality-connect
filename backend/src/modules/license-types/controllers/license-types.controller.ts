import { Controller, Get } from '@nestjs/common';

@Controller('license-types')
export class LicenseTypesController {
  @Get('meta')
  getMeta() {
    return {
      module: 'license-types',
      implementationStatus: 'skeleton',
    };
  }
}

