import { Injectable } from '@nestjs/common';

@Injectable()
export class LicensesService {
  getModuleInfo() {
    return {
      module: 'licenses',
      status: 'ready-for-expansion',
    };
  }
}

