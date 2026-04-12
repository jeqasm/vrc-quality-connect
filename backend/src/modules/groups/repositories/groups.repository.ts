import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type GroupDetailsProjection = Prisma.GroupGetPayload<{
  include: {
    department: true;
    memberships: {
      include: {
        user: true;
      };
    };
    permissionAssignments: {
      include: {
        permission: true;
      };
    };
  };
}>;

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<GroupDetailsProjection[]> {
    return this.prisma.group.findMany({
      include: {
        department: true,
        memberships: {
          include: {
            user: true,
          },
        },
        permissionAssignments: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  findById(id: string): Promise<GroupDetailsProjection | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        department: true,
        memberships: {
          include: {
            user: true,
          },
        },
        permissionAssignments: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  create(input: {
    code: string;
    name: string;
    description?: string;
    type: string;
    departmentId?: string;
  }): Promise<GroupDetailsProjection> {
    return this.prisma.group.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        type: input.type,
        departmentId: input.departmentId,
      },
      include: {
        department: true,
        memberships: {
          include: {
            user: true,
          },
        },
        permissionAssignments: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  assignMember(groupId: string, userId: string): Promise<{ id: string }> {
    return this.prisma.groupMembership.upsert({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      update: {},
      create: {
        groupId,
        userId,
      },
      select: { id: true },
    });
  }

  async replacePermissions(groupId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.groupPermissionAssignment.deleteMany({
        where: { groupId },
      });

      if (permissionIds.length === 0) {
        return;
      }

      await transaction.groupPermissionAssignment.createMany({
        data: permissionIds.map((permissionId) => ({
          groupId,
          permissionId,
        })),
      });
    });
  }

  findPermissionIdsByCodes(codes: string[]): Promise<Array<{ id: string; code: string }>> {
    return this.prisma.accessPermission.findMany({
      where: {
        code: {
          in: codes,
        },
      },
      select: {
        id: true,
        code: true,
      },
    });
  }

  findUserById(userId: string): Promise<{ id: string } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
  }
}
