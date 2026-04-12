import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '../../../common/auth/authenticated-request';
import { AuthenticatedAccountEntity } from '../entities/authenticated-account.entity';

export const CurrentAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAccountEntity => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.currentAccount!;
  },
);
