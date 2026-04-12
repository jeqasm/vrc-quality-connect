import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../../../common/auth/authenticated-request';
import { PermissionDeniedError } from '../../../common/errors/permission-denied.error';
import { REQUIRED_PERMISSIONS_METADATA_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const currentAccount = request.currentAccount;

    if (!currentAccount) {
      throw new PermissionDeniedError('Authenticated account context is missing');
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      currentAccount.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new PermissionDeniedError('Current account does not have required permissions');
    }

    return true;
  }
}
