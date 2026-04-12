import { Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { LicenseRegistrySnapshotResponseDto } from '../dto/license-registry-snapshot-response.dto';
import { LicenseRegistryRecordResponseDto } from '../dto/license-registry-record-response.dto';
import { CreateLicenseRegistryRecordDto } from '../dto/create-license-registry-record.dto';
import { QueryLicenseRegistryDto } from '../dto/query-license-registry.dto';
import { UpdateLicenseRegistryRecordDto } from '../dto/update-license-registry-record.dto';
import { LicenseRegistryRecordWithRelations, LicenseRegistryRecordsRepository } from '../repositories/license-registry-records.repository';

@Injectable()
export class LicenseRegistryRecordsService {
  constructor(private readonly licenseRegistryRecordsRepository: LicenseRegistryRecordsRepository) {}

  async getSnapshot(dto: QueryLicenseRegistryDto): Promise<LicenseRegistrySnapshotResponseDto> {
    const limit = dto.limit ?? 10;
    const offset = dto.offset ?? 0;
    const hasFullPeriod = Boolean(dto.dateFrom && dto.dateTo);
    const dateFrom = hasFullPeriod ? dto.dateFrom : undefined;
    const dateTo = hasFullPeriod ? dto.dateTo : undefined;
    const [rows, summary] = await Promise.all([
      this.licenseRegistryRecordsRepository.findManyByPeriod(dateFrom, dateTo, {
        limit,
        offset,
      }),
      this.licenseRegistryRecordsRepository.summarizeByPeriod(dateFrom, dateTo),
    ]);

    return {
      dateFrom: dateFrom ?? '',
      dateTo: dateTo ?? '',
      limit,
      offset,
      totalIssuedLicenses: summary.totalIssuedLicenses,
      totalRecords: summary.totalRecords,
      uniqueRecipients: summary.uniqueRecipients,
      uniqueOrganizations: summary.uniqueOrganizations,
      rows: rows.map((row) => this.mapRecord(row)),
    };
  }

  create(
    dto: CreateLicenseRegistryRecordDto,
    currentUserId: string,
  ): Promise<LicenseRegistryRecordResponseDto> {
    return this.licenseRegistryRecordsRepository
      .create({
        issueDate: new Date(`${dto.issueDate}T00:00:00.000Z`),
        licenseTypeId: dto.licenseTypeId,
        quantity: dto.quantity,
        organizationName: dto.organizationName?.trim() || undefined,
        recipientEmail: dto.recipientEmail?.trim().toLowerCase() || undefined,
        issuedTo: dto.issuedTo.trim(),
        comment: dto.comment?.trim() || undefined,
        createdByUserId: currentUserId,
      })
      .then((record) => this.mapRecord(record));
  }

  async update(id: string, dto: UpdateLicenseRegistryRecordDto): Promise<LicenseRegistryRecordResponseDto> {
    const existingRecord = await this.licenseRegistryRecordsRepository.findById(id);

    if (!existingRecord) {
      throw new ApplicationNotFoundError('License registry record', `id=${id}`);
    }

    const updatedRecord = await this.licenseRegistryRecordsRepository.update(id, {
      issueDate: new Date(`${dto.issueDate ?? existingRecord.issueDate.toISOString().slice(0, 10)}T00:00:00.000Z`),
      licenseTypeId: dto.licenseTypeId ?? existingRecord.licenseTypeId,
      quantity: dto.quantity ?? existingRecord.quantity,
      organizationName: dto.organizationName?.trim() ?? existingRecord.organizationName ?? undefined,
      recipientEmail: dto.recipientEmail?.trim().toLowerCase() ?? existingRecord.recipientEmail ?? undefined,
      issuedTo: dto.issuedTo?.trim() ?? existingRecord.issuedTo,
      comment: dto.comment?.trim() ?? existingRecord.comment ?? undefined,
    });

    return this.mapRecord(updatedRecord);
  }

  async delete(id: string): Promise<void> {
    const existingRecord = await this.licenseRegistryRecordsRepository.findById(id);

    if (!existingRecord) {
      throw new ApplicationNotFoundError('License registry record', `id=${id}`);
    }

    await this.licenseRegistryRecordsRepository.delete(id);
  }

  private mapRecord(record: LicenseRegistryRecordWithRelations): LicenseRegistryRecordResponseDto {
    return {
      id: record.id,
      issueDate: record.issueDate.toISOString().slice(0, 10),
      quantity: record.quantity,
      organizationName: record.organizationName,
      recipientEmail: record.recipientEmail,
      issuedTo: record.issuedTo,
      comment: record.comment,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      licenseType: {
        id: record.licenseType.id,
        code: record.licenseType.code,
        name: record.licenseType.name,
      },
    };
  }
}
