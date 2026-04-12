import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type AuthSessionWithAccount = Prisma.AuthSessionGetPayload<{
  include: {
    authAccount: {
      include: {
        user: {
          include: {
            department: true;
            accessRole: true;
            groupMemberships: {
              include: {
                group: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AuthSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    authAccountId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string; expiresAt: Date }> {
    return this.prisma.authSession.create({
      data: {
        authAccountId: input.authAccountId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });
  }

  findActiveByTokenHash(tokenHash: string): Promise<AuthSessionWithAccount | null> {
    return this.prisma.authSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        authAccount: {
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
        },
      },
    });
  }

  revokeByTokenHash(tokenHash: string): Promise<{ id: string } | null> {
    return this.prisma.authSession
      .update({
        where: { tokenHash },
        data: {
          revokedAt: new Date(),
        },
        select: { id: true },
      })
      .catch(() => null);
  }
}
