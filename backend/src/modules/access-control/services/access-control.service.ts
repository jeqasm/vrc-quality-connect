import { Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { EffectiveAccessContract } from '../contracts/effective-access.contract';
import { AccessControlRepository } from '../repositories/access-control.repository';

@Injectable()
export class AccessControlService {
  constructor(private readonly accessControlRepository: AccessControlRepository) {}

  async getEffectiveAccessForUser(userId: string): Promise<EffectiveAccessContract> {
    const projection = await this.accessControlRepository.findUserAccessProjection(userId);

    if (!projection) {
      throw new ApplicationNotFoundError('User', `id=${userId}`);
    }

    const effectivePermissions = new Set<string>();

    for (const assignment of projection.accessRole.rolePermissions) {
      effectivePermissions.add(assignment.permission.code);
    }

    for (const membership of projection.groupMemberships) {
      for (const assignment of membership.group.permissionAssignments) {
        effectivePermissions.add(assignment.permission.code);
      }
    }

    return {
      roleCode: projection.accessRole.code,
      roleName: projection.accessRole.name,
      permissions: [...effectivePermissions].sort(),
    };
  }
}
