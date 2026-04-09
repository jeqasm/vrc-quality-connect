import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { LicenseRegistryRow } from '../contracts/license-registry-row.contract';

export type PersistableLicenseRegistryEntry = {
  sourceRowNumber: number;
  issueDate: Date;
  quantity: number;
  licenseType: string;
  organizationName: string | null;
  recipientEmail: string | null;
  issuedTo: string;
};

type SaveRegistrySnapshotInput = {
  sourceDocumentUrl: string;
  sourceSheetName: string;
  totalSourceRows: number;
  importedRows: number;
  skippedRows: number;
  entries: PersistableLicenseRegistryEntry[];
};

type ActiveBatchSnapshot = {
  sourceDocumentUrl: string;
  sourceSheetName: string;
  totalSourceRows: number;
  importedRows: number;
  skippedRows: number;
  importedAt: Date;
};

@Injectable()
export class LicenseRegistryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveSnapshot(input: SaveRegistrySnapshotInput): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.licenseRegistryImportBatch.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      const batch = await transaction.licenseRegistryImportBatch.create({
        data: {
          sourceDocumentUrl: input.sourceDocumentUrl,
          sourceSheetName: input.sourceSheetName,
          totalSourceRows: input.totalSourceRows,
          importedRows: input.importedRows,
          skippedRows: input.skippedRows,
          isActive: true,
        },
      });

      if (input.entries.length === 0) {
        return;
      }

      await transaction.licenseRegistryEntry.createMany({
        data: input.entries.map((entry) => ({
          importBatchId: batch.id,
          sourceRowNumber: entry.sourceRowNumber,
          issueDate: entry.issueDate,
          quantity: entry.quantity,
          licenseType: entry.licenseType,
          organizationName: entry.organizationName,
          recipientEmail: entry.recipientEmail,
          issuedTo: entry.issuedTo,
        })),
      });
    });
  }

  async aggregateActiveEntriesByPeriod(
    dateFrom: string,
    dateTo: string,
  ): Promise<{ rows: LicenseRegistryRow[]; matchedSourceRows: number }> {
    const entries = await this.prisma.$queryRaw<
      Array<{ licenseType: string; quantity: number; issuedTo: string }>
    >(Prisma.sql`
      SELECT
        license_type AS "licenseType",
        quantity,
        issued_to AS "issuedTo"
      FROM license_registry_entries
      WHERE issue_date >= ${dateFrom}::date
        AND issue_date <= ${dateTo}::date
        AND import_batch_id IN (
          SELECT id
          FROM license_registry_import_batches
          WHERE is_active = true
        )
      ORDER BY issue_date ASC, license_type ASC
    `);

    const groupedRows = new Map<
      string,
      {
        licenseType: string;
        quantity: number;
        recipients: Set<string>;
      }
    >();

    entries.forEach((entry) => {
      const normalizedLicenseType = entry.licenseType.replace(/\s+/g, ' ').trim();
      const groupKey = normalizedLicenseType.toLocaleLowerCase('ru-RU');
      const currentGroup = groupedRows.get(groupKey);

      if (currentGroup) {
        currentGroup.quantity += entry.quantity;
        currentGroup.recipients.add(entry.issuedTo);
        return;
      }

      groupedRows.set(groupKey, {
        licenseType: normalizedLicenseType,
        quantity: entry.quantity,
        recipients: new Set([entry.issuedTo]),
      });
    });

    return {
      matchedSourceRows: entries.length,
      rows: Array.from(groupedRows.values())
        .map((group) => ({
          licenseType: group.licenseType,
          quantity: group.quantity,
          issuedTo: Array.from(group.recipients).join(', '),
        }))
        .sort((left, right) => {
          if (left.quantity !== right.quantity) {
            return left.quantity - right.quantity;
          }

          return left.licenseType.localeCompare(right.licenseType, 'ru-RU');
        }),
    };
  }

  findActiveBatch(): Promise<ActiveBatchSnapshot | null> {
    return this.prisma.licenseRegistryImportBatch.findFirst({
      where: { isActive: true },
      orderBy: { importedAt: 'desc' },
      select: {
        sourceDocumentUrl: true,
        sourceSheetName: true,
        totalSourceRows: true,
        importedRows: true,
        skippedRows: true,
        importedAt: true,
      },
    });
  }
}
