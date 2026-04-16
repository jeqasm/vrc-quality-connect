import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { CreateLicenseTypeDto } from '../dto/create-license-type.dto';
import { LicenseTypeResponseDto } from '../dto/license-type-response.dto';
import { LicenseTypesRepository } from '../repositories/license-types.repository';

@Injectable()
export class LicenseTypesService {
  constructor(private readonly licenseTypesRepository: LicenseTypesRepository) {}

  async findMany(): Promise<LicenseTypeResponseDto[]> {
    return this.licenseTypesRepository.findMany();
  }

  async create(dto: CreateLicenseTypeDto): Promise<LicenseTypeResponseDto> {
    const normalizedName = dto.name.replace(/\s+/g, ' ').trim();

    if (!normalizedName) {
      throw new BadRequestException('Название типа лицензии не может быть пустым');
    }

    try {
      return await this.licenseTypesRepository.create({
        code: this.buildCode(normalizedName),
        name: normalizedName,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new BadRequestException('Такой тип лицензии уже существует');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const existingLicenseType = await this.licenseTypesRepository.findById(id);

    if (!existingLicenseType) {
      throw new ApplicationNotFoundError('License type', `id=${id}`);
    }

    try {
      await this.licenseTypesRepository.delete(id);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2003'
      ) {
        throw new BadRequestException(
          'Нельзя удалить тип лицензии, который используется в реестре или операциях',
        );
      }

      throw error;
    }
  }

  private buildCode(name: string): string {
    const normalized = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const prefix = normalized || 'license-type';
    const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    return `${prefix}-${suffix}`;
  }
}
