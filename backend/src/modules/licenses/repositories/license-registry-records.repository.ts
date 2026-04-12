import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type LicenseRegistryRecordWithRelations = Prisma.LicenseRegistryRecordGetPayload<{
  include: {
    licenseType: true;
  };
}>;

@Injectable()
export class LicenseRegistryRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByPeriod(
    dateFrom?: string,
    dateTo?: string,
    pagination?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<LicenseRegistryRecordWithRelations[]> {
    const issueDateFilter: Prisma.DateTimeFilter = {};

    if (dateFrom) {
      issueDateFilter.gte = new Date(`${dateFrom}T00:00:00.000Z`);
    }

    if (dateTo) {
      issueDateFilter.lte = new Date(`${dateTo}T00:00:00.000Z`);
    }

    return this.prisma.licenseRegistryRecord.findMany({
      where: Object.keys(issueDateFilter).length > 0 ? { issueDate: issueDateFilter } : undefined,
      include: {
        licenseType: true,
      },
      orderBy: [
        { issueDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: pagination?.limit,
      skip: pagination?.offset,
    });
  }

  findById(id: string): Promise<LicenseRegistryRecordWithRelations | null> {
    return this.prisma.licenseRegistryRecord.findUnique({
      where: { id },
      include: {
        licenseType: true,
      },
    });
  }

  create(input: {
    issueDate: Date;
    licenseTypeId: string;
    quantity: number;
    organizationName?: string;
    recipientEmail?: string;
    issuedTo: string;
    comment?: string;
    createdByUserId: string;
  }): Promise<LicenseRegistryRecordWithRelations> {
    return this.prisma.licenseRegistryRecord.create({
      data: {
        issueDate: input.issueDate,
        licenseTypeId: input.licenseTypeId,
        quantity: input.quantity,
        organizationName: input.organizationName,
        recipientEmail: input.recipientEmail,
        issuedTo: input.issuedTo,
        comment: input.comment,
        createdByUserId: input.createdByUserId,
      },
      include: {
        licenseType: true,
      },
    });
  }

  update(
    id: string,
    input: {
      issueDate: Date;
      licenseTypeId: string;
      quantity: number;
      organizationName?: string;
      recipientEmail?: string;
      issuedTo: string;
      comment?: string;
    },
  ): Promise<LicenseRegistryRecordWithRelations> {
    return this.prisma.licenseRegistryRecord.update({
      where: { id },
      data: {
        issueDate: input.issueDate,
        licenseTypeId: input.licenseTypeId,
        quantity: input.quantity,
        organizationName: input.organizationName,
        recipientEmail: input.recipientEmail,
        issuedTo: input.issuedTo,
        comment: input.comment,
      },
      include: {
        licenseType: true,
      },
    });
  }

  delete(id: string): Promise<{ id: string }> {
    return this.prisma.licenseRegistryRecord.delete({
      where: { id },
      select: { id: true },
    });
  }

  async summarizeByPeriod(dateFrom?: string, dateTo?: string): Promise<{
    totalIssuedLicenses: number;
    totalRecords: number;
    uniqueRecipients: number;
    uniqueOrganizations: number;
  }> {
    const whereClauses: Prisma.Sql[] = [];

    if (dateFrom) {
      whereClauses.push(Prisma.sql`issue_date >= ${dateFrom}::date`);
    }

    if (dateTo) {
      whereClauses.push(Prisma.sql`issue_date <= ${dateTo}::date`);
    }

    const whereSql =
      whereClauses.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereClauses, ' AND ')}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      Array<{
        totalIssuedLicenses: bigint | number | null;
        totalRecords: bigint | number;
        uniqueRecipients: bigint | number;
        uniqueOrganizations: bigint | number;
      }>
    >(Prisma.sql`
      SELECT
        COALESCE(SUM(quantity), 0) AS "totalIssuedLicenses",
        COUNT(*) AS "totalRecords",
        COUNT(DISTINCT issued_to) AS "uniqueRecipients",
        COUNT(DISTINCT NULLIF(TRIM(COALESCE(organization_name, '')), '')) AS "uniqueOrganizations"
      FROM license_registry_records
      ${whereSql}
    `);

    const row = rows[0] ?? {
      totalIssuedLicenses: 0,
      totalRecords: 0,
      uniqueRecipients: 0,
      uniqueOrganizations: 0,
    };

    return {
      totalIssuedLicenses: Number(row.totalIssuedLicenses ?? 0),
      totalRecords: Number(row.totalRecords ?? 0),
      uniqueRecipients: Number(row.uniqueRecipients ?? 0),
      uniqueOrganizations: Number(row.uniqueOrganizations ?? 0),
    };
  }
}
