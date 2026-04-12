import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS_METADATA_KEY = 'requiredPermissions';

export function RequirePermissions(...permissions: string[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_METADATA_KEY, permissions);
}
