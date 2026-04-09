import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

  async aggregateLicenseTotals(dateFrom: string, dateTo: string): Promise<{
    totalIssuedLicenses: number;
    totalRegistryEntries: number;
  }> {
    const rows = await this.prisma.$queryRaw<
      Array<{ totalIssuedLicenses: bigint | number | null; totalRegistryEntries: bigint | number }>
    >(Prisma.sql`
      SELECT
        COALESCE(SUM(quantity), 0) AS "totalIssuedLicenses",
        COUNT(*) AS "totalRegistryEntries"
      FROM license_registry_entries
      WHERE issue_date >= ${dateFrom}::date
        AND issue_date <= ${dateTo}::date
        AND import_batch_id IN (
          SELECT id
          FROM license_registry_import_batches
          WHERE is_active = true
        )
    `);

    const aggregate = rows[0] ?? { totalIssuedLicenses: 0, totalRegistryEntries: 0 };

    return {
      totalIssuedLicenses: Number(aggregate.totalIssuedLicenses ?? 0),
      totalRegistryEntries: Number(aggregate.totalRegistryEntries ?? 0),
    };
  }

  async groupLicenseQuantityByType(
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ licenseType: string; quantity: number }>> {
    const groups = await this.prisma.$queryRaw<Array<{ licenseType: string; quantity: bigint | number }>>(
      Prisma.sql`
        SELECT
          license_type AS "licenseType",
          SUM(quantity) AS "quantity"
        FROM license_registry_entries
        WHERE issue_date >= ${dateFrom}::date
          AND issue_date <= ${dateTo}::date
          AND import_batch_id IN (
            SELECT id
            FROM license_registry_import_batches
            WHERE is_active = true
          )
        GROUP BY license_type
        ORDER BY SUM(quantity) DESC, license_type ASC
      `,
    );

    return groups.map((group) => ({
      licenseType: group.licenseType,
      quantity: Number(group.quantity),
    }));
  }

  async groupLicenseQuantityByDate(
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ issueDate: string; quantity: number }>> {
    const rows = await this.prisma.$queryRaw<Array<{ issueDate: string; quantity: bigint | number }>>(
      Prisma.sql`
        SELECT
          TO_CHAR(issue_date, 'YYYY-MM-DD') AS "issueDate",
          SUM(quantity) AS "quantity"
        FROM license_registry_entries
        WHERE issue_date >= ${dateFrom}::date
          AND issue_date <= ${dateTo}::date
          AND import_batch_id IN (
            SELECT id
            FROM license_registry_import_batches
            WHERE is_active = true
          )
        GROUP BY issue_date
        ORDER BY issue_date ASC
      `,
    );

    return rows.map((row) => ({
      issueDate: row.issueDate,
      quantity: Number(row.quantity),
    }));
  }

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
