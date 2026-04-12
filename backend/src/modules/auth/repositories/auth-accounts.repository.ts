import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type AuthAccountWithUser = Prisma.AuthAccountGetPayload<{
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
}>;

@Injectable()
export class AuthAccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<AuthAccountWithUser | null> {
    return this.prisma.authAccount.findUnique({
      where: { email },
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
  }

  findById(id: string): Promise<AuthAccountWithUser | null> {
    return this.prisma.authAccount.findUnique({
      where: { id },
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
  }

  async create(input: {
    email: string;
    fullName: string;
    departmentId: string;
    accessRoleId: string;
    passwordHash: string;
  }): Promise<AuthAccountWithUser> {
    return this.prisma.authAccount.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        status: 'active',
        emailVerifiedAt: new Date(),
        user: {
          create: {
            email: input.email,
            fullName: input.fullName,
            departmentId: input.departmentId,
            accessRoleId: input.accessRoleId,
          },
        },
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
  }

  updateLastLoginAt(id: string, lastLoginAt: Date): Promise<{ id: string }> {
    return this.prisma.authAccount.update({
      where: { id },
      data: { lastLoginAt },
      select: { id: true },
    });
  }
}
