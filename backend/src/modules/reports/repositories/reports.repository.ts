import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

type DurationAggregate = {
  _sum: {
    durationMinutes: number | null;
  };
  _count: {
    _all: number;
  };
};

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  aggregateTotals(): Promise<DurationAggregate> {
    return this.prisma.activityRecord.aggregate({
      _sum: {
        durationMinutes: true,
      },
      _count: {
        _all: true,
      },
    });
  }

  async groupHoursByUser(): Promise<
    Array<{
      userId: string;
      _sum: { durationMinutes: number | null };
      user: { email: string; fullName: string };
    }>
  > {
    const groups = await this.prisma.activityRecord.groupBy({
      by: ['userId'],
      _sum: {
        durationMinutes: true,
      },
      orderBy: {
        _sum: {
          durationMinutes: 'desc',
        },
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: groups.map((group) => group.userId) },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    return groups
      .map((group) => {
        const user = usersById.get(group.userId);

        if (!user) {
          return null;
        }

        return {
          userId: group.userId,
          _sum: group._sum,
          user,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async groupHoursByActivityType(): Promise<
    Array<{
      activityTypeId: string;
      _sum: { durationMinutes: number | null };
      activityType: { code: string; name: string };
    }>
  > {
    const groups = await this.prisma.activityRecord.groupBy({
      by: ['activityTypeId'],
      _sum: {
        durationMinutes: true,
      },
      orderBy: {
        _sum: {
          durationMinutes: 'desc',
        },
      },
    });

    const activityTypes = await this.prisma.activityType.findMany({
      where: {
        id: { in: groups.map((group) => group.activityTypeId) },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    const activityTypesById = new Map(activityTypes.map((item) => [item.id, item]));

    return groups
      .map((group) => {
        const activityType = activityTypesById.get(group.activityTypeId);

        if (!activityType) {
          return null;
        }

        return {
          activityTypeId: group.activityTypeId,
          _sum: group._sum,
          activityType,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
