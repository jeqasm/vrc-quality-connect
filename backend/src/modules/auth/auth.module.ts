import { Module, forwardRef } from '@nestjs/common';

import { AccessControlModule } from '../access-control/access-control.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthSessionGuard } from './guards/auth-session.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthAccountsRepository } from './repositories/auth-accounts.repository';
import { AuthRegistrationRepository } from './repositories/auth-registration.repository';
import { AuthSessionsRepository } from './repositories/auth-sessions.repository';
import { RegistrationInvitesRepository } from './repositories/registration-invites.repository';
import { AuthService } from './services/auth.service';
import { LoginAttemptLimiterService } from './services/login-attempt-limiter.service';
import { AuthTokensService } from './services/auth-tokens.service';
import { PasswordHashService } from './services/password-hash.service';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AccessControlModule)],
  controllers: [AuthController],
  providers: [
    AuthAccountsRepository,
    AuthRegistrationRepository,
    AuthSessionsRepository,
    RegistrationInvitesRepository,
    PasswordHashService,
    AuthTokensService,
    LoginAttemptLimiterService,
    AuthService,
    AuthSessionGuard,
    PermissionsGuard,
  ],
  exports: [AuthService, AuthSessionGuard, PermissionsGuard],
})
export class AuthModule {}
