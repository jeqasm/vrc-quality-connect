import { Injectable } from '@nestjs/common';

import { LicenseTypesService } from '../../license-types/services/license-types.service';
import { LicenseMetaResponseDto } from '../dto/license-meta-response.dto';

@Injectable()
export class LicensesService {
  constructor(private readonly licenseTypesService: LicenseTypesService) {}

  async getMeta(): Promise<LicenseMetaResponseDto> {
    return {
      module: 'licenses',
      implementationStatus: 'manual-registry',
      licenseTypes: await this.licenseTypesService.findMany(),
    };
  }
}
