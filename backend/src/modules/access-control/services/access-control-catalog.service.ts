import { Injectable } from '@nestjs/common';

import { AccessPermissionResponseDto } from '../dto/access-permission-response.dto';
import { AccessControlCatalogRepository } from '../repositories/access-control-catalog.repository';

@Injectable()
export class AccessControlCatalogService {
  constructor(private readonly accessControlCatalogRepository: AccessControlCatalogRepository) {}

  async findPermissions(): Promise<AccessPermissionResponseDto[]> {
    const permissions = await this.accessControlCatalogRepository.findPermissions();

    return permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      category: permission.category,
    }));
  }
}
