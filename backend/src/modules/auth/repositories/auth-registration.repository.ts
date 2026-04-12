import { Injectable } from '@nestjs/common';

import { AuthenticationFailedError } from '../../../common/errors/authentication-failed.error';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthAccountWithUser } from './auth-accounts.repository';

@Injectable()
export class AuthRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerByInvite(input: {
    inviteId: string;
    inviteTokenHash: string;
    inviteEmail?: string | null;
    email: string;
    fullName: string;
    passwordHash: string;
  }): Promise<AuthAccountWithUser> {
    return this.prisma.$transaction(async (transactionClient) => {
      if (input.inviteEmail && input.inviteEmail.toLowerCase() !== input.email.toLowerCase()) {
        throw new AuthenticationFailedError('Invite is bound to a different email');
      }

      const inviteUpdateResult = await transactionClient.registrationInvite.updateMany({
        where: {
          id: input.inviteId,
          tokenHash: input.inviteTokenHash,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (inviteUpdateResult.count !== 1) {
        throw new AuthenticationFailedError('Invite is no longer available');
      }

      const existingAccount = await transactionClient.authAccount.findUnique({
        where: {
          email: input.email.toLowerCase(),
        },
        select: {
          id: true,
        },
      });

      if (existingAccount) {
        throw new AuthenticationFailedError('Account with this email already exists');
      }

      const invite = await transactionClient.registrationInvite.findUnique({
        where: { id: input.inviteId },
        select: {
          departmentId: true,
          accessRoleId: true,
        },
      });

      if (!invite) {
        throw new AuthenticationFailedError('Invite is no longer available');
      }

      await transactionClient.authAccount.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash: input.passwordHash,
          status: 'active',
          emailVerifiedAt: new Date(),
          user: {
            create: {
              email: input.email.toLowerCase(),
              fullName: input.fullName,
              departmentId: invite.departmentId,
              accessRoleId: invite.accessRoleId,
            },
          },
        },
      });

      return transactionClient.authAccount.findUniqueOrThrow({
        where: {
          email: input.email.toLowerCase(),
        },
        include: {
          user: {
            include: {
              department: true,
              accessRole: true,
              groupMemberships: {
                include: {
                  group: true,
                },
              },
            },
          },
        },
      });
    });
  }
}
