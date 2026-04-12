import { Request } from 'express';

import { AuthenticatedAccountEntity } from '../../modules/auth/entities/authenticated-account.entity';

export type AuthenticatedRequest = Request & {
  currentAccount?: AuthenticatedAccountEntity;
};
