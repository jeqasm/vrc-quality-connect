import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthenticatedRequest } from '../../../common/auth/authenticated-request';
import { AuthenticationFailedError } from '../../../common/errors/authentication-failed.error';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthSessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new AuthenticationFailedError('Bearer token is required');
    }

    const accessToken = authorizationHeader.slice('Bearer '.length).trim();

    if (!accessToken) {
      throw new AuthenticationFailedError('Bearer token is required');
    }

    request.currentAccount = await this.authService.getCurrentAccountByToken(accessToken);
    return true;
  }
}
