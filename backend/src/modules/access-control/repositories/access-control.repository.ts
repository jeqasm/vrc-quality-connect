import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type UserAccessProjection = Prisma.UserGetPayload<{
  include: {
    accessRole: {
      include: {
        rolePermissions: {
          include: {
            permission: true;
          };
        };
      };
    };
    groupMemberships: {
      include: {
        group: {
          include: {
            permissionAssignments: {
              include: {
                permission: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AccessControlRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserAccessProjection(userId: string): Promise<UserAccessProjection | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        accessRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        groupMemberships: {
          include: {
            group: {
              include: {
                permissionAssignments: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
