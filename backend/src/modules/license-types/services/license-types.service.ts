import { Injectable } from '@nestjs/common';

import { LicenseTypeResponseDto } from '../dto/license-type-response.dto';
import { LicenseTypesRepository } from '../repositories/license-types.repository';

@Injectable()
export class LicenseTypesService {
  constructor(private readonly licenseTypesRepository: LicenseTypesRepository) {}

  async findMany(): Promise<LicenseTypeResponseDto[]> {
    return this.licenseTypesRepository.findMany();
  }
}
