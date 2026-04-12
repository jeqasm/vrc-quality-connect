import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RefreshLicenseRegistryDto } from '../dto/refresh-license-registry.dto';
import { RefreshLicenseRegistryResponseDto } from '../dto/refresh-license-registry-response.dto';
import { QueryLicenseRegistryDto } from '../dto/query-license-registry.dto';
import { CsvLicenseRegistryParser } from '../infrastructure/csv-license-registry.parser';
import { GoogleSheetsLicenseRegistryClient } from '../infrastructure/google-sheets-license-registry.client';
import {
  LicenseRegistryRepository,
  PersistableLicenseRegistryEntry,
} from '../repositories/license-registry.repository';

type LicenseRegistryWarning = {
  sourceRowNumber: number;
  message: string;
};

const headerAliases = {
  recipientName: [
    'реестр выданных лицензий фио получателя',
    'фио получателя',
    'получатель',
  ],
  issueDate: ['дата выдачи'],
  quantity: ['количество', 'количество '],
  organizationName: ['наименование организации'],
  recipientEmail: ['адрес электронной почты'],
  licensePurpose: [
    'назначение лицензии/цель использования',
    'назначение лицензии / цель использования',
  ],
} as const;

@Injectable()
export class RefreshLicenseRegistryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly googleSheetsClient: GoogleSheetsLicenseRegistryClient,
    private readonly csvParser: CsvLicenseRegistryParser,
    private readonly licenseRegistryRepository: LicenseRegistryRepository,
  ) {}

  async execute(dto: RefreshLicenseRegistryDto): Promise<RefreshLicenseRegistryResponseDto> {
    const dateFrom = this.parseIsoDate(dto.dateFrom);
    const dateTo = this.parseIsoDate(dto.dateTo);

    if (dateFrom.getTime() > dateTo.getTime()) {
      throw new BadRequestException('dateFrom must be less than or equal to dateTo');
    }

    const csvContent = await this.googleSheetsClient.downloadRegistryCsv();
    const parsedRows = this.csvParser.parse(csvContent);
    const headerRowIndex = this.findHeaderRowIndex(parsedRows);

    if (headerRowIndex === -1) {
      throw new BadRequestException('License registry headers were not found in the Google Sheet');
    }

    const headerRow = parsedRows[headerRowIndex];
    const headerIndexes = this.resolveHeaderIndexes(headerRow);
    const warnings: LicenseRegistryWarning[] = [];
    const persistableEntries: PersistableLicenseRegistryEntry[] = [];
    const indexedRows = parsedRows
      .slice(headerRowIndex + 1)
      .map((row, rowIndex) => ({
        row,
        sourceRowNumber: headerRowIndex + rowIndex + 2,
      }));
    const totalSourceRows = indexedRows.filter(({ row }) => !this.isBlankRow(row)).length;

    for (const { row, sourceRowNumber } of indexedRows) {
      if (this.isBlankRow(row)) {
        continue;
      }

      const recipientName = this.readCell(row, headerIndexes.recipientName);
      const issueDateRaw = this.readCell(row, headerIndexes.issueDate);
      const quantityRaw = this.readCell(row, headerIndexes.quantity);
      const organizationName = this.readCell(row, headerIndexes.organizationName);
      const recipientEmail = this.readCell(row, headerIndexes.recipientEmail);
      const licensePurpose = this.readCell(row, headerIndexes.licensePurpose);

      if (this.isBlankRow(row)) {
        continue;
      }

      if (!recipientName && !issueDateRaw && !quantityRaw && !organizationName && !recipientEmail && !licensePurpose) {
        continue;
      }

      if (!issueDateRaw) {
        continue;
      }

      const issueDate = this.parseRegistryDate(issueDateRaw);
      if (!issueDate) {
        continue;
      }

      const quantity = this.parseQuantity(quantityRaw);
      if (quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
        continue;
      }

      persistableEntries.push({
        sourceRowNumber,
        issueDate,
        quantity,
        licenseType: licensePurpose || 'Не определено',
        organizationName: this.toNullableValue(organizationName),
        recipientEmail: this.toNullableValue(recipientEmail),
        issuedTo: this.resolveIssuedTo(recipientName, organizationName, recipientEmail),
      });
    }

    let hasEnteredPeriodWindow = false;

    for (const { row, sourceRowNumber } of indexedRows.reverse()) {
      if (hasEnteredPeriodWindow && this.canStopReverseScan(row, headerIndexes.issueDate, dateFrom)) {
        break;
      }

      if (this.isBlankRow(row)) {
        continue;
      }

      const recipientName = this.readCell(row, headerIndexes.recipientName);
      const issueDateRaw = this.readCell(row, headerIndexes.issueDate);
      const quantityRaw = this.readCell(row, headerIndexes.quantity);
      const organizationName = this.readCell(row, headerIndexes.organizationName);
      const recipientEmail = this.readCell(row, headerIndexes.recipientEmail);
      const licensePurpose = this.readCell(row, headerIndexes.licensePurpose);

      if (!recipientName && !issueDateRaw && !quantityRaw && !organizationName && !recipientEmail && !licensePurpose) {
        continue;
      }

      if (!issueDateRaw) {
        warnings.push({
          sourceRowNumber,
          message: 'Issue date is required',
        });
        continue;
      }

      const issueDate = this.parseRegistryDate(issueDateRaw);
      if (!issueDate) {
        warnings.push({
          sourceRowNumber,
          message: 'Issue date must use dd.mm.yyyy or dd.mm.yy format',
        });
        continue;
      }

      if (issueDate.getTime() > dateTo.getTime()) {
        continue;
      }

      if (issueDate.getTime() < dateFrom.getTime()) {
        continue;
      }

      hasEnteredPeriodWindow = true;

      const quantity = this.parseQuantity(quantityRaw);
      if (quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
        warnings.push({
          sourceRowNumber,
          message: 'Quantity must start with a positive integer',
        });
        continue;
      }
    }

    const sourceDocumentUrl =
      this.configService.get<string>('licenses.registrySheetUrl') ?? '';
    const sourceSheetName =
      this.configService.get<string>('licenses.registrySheetName') ?? 'Unknown sheet';

    await this.licenseRegistryRepository.saveSnapshot({
      sourceDocumentUrl,
      sourceSheetName,
      totalSourceRows,
      importedRows: persistableEntries.length,
      skippedRows: warnings.length,
      entries: persistableEntries,
    });

    const aggregate = await this.licenseRegistryRepository.aggregateActiveEntriesByPeriod(
      dto.dateFrom,
      dto.dateTo,
    );

    return {
      importedAt: new Date().toISOString(),
      sourceSheetName,
      sourceDocumentUrl,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      totalSourceRows,
      matchedSourceRows: aggregate.matchedSourceRows,
      aggregatedRows: aggregate.rows.length,
      skippedRows: warnings.length,
      rows: aggregate.rows,
      warnings,
    };
  }

  async getSnapshot(dto: QueryLicenseRegistryDto): Promise<RefreshLicenseRegistryResponseDto> {
    const hasFullPeriod = Boolean(dto.dateFrom && dto.dateTo);

    if (hasFullPeriod) {
      const dateFrom = this.parseIsoDate(dto.dateFrom!);
      const dateTo = this.parseIsoDate(dto.dateTo!);

      if (dateFrom.getTime() > dateTo.getTime()) {
        throw new BadRequestException('dateFrom must be less than or equal to dateTo');
      }
    }

    const activeBatch = await this.licenseRegistryRepository.findActiveBatch();

    if (!activeBatch) {
      return {
        importedAt: '',
        sourceSheetName: '',
        sourceDocumentUrl: '',
        dateFrom: hasFullPeriod ? dto.dateFrom! : '',
        dateTo: hasFullPeriod ? dto.dateTo! : '',
        totalSourceRows: 0,
        matchedSourceRows: 0,
        aggregatedRows: 0,
        skippedRows: 0,
        rows: [],
        warnings: [],
      };
    }

    const aggregate = await this.licenseRegistryRepository.aggregateActiveEntriesByPeriod(
      hasFullPeriod ? dto.dateFrom : undefined,
      hasFullPeriod ? dto.dateTo : undefined,
    );

    return {
      importedAt: activeBatch.importedAt.toISOString(),
      sourceSheetName: activeBatch.sourceSheetName,
      sourceDocumentUrl: activeBatch.sourceDocumentUrl,
      dateFrom: hasFullPeriod ? dto.dateFrom! : '',
      dateTo: hasFullPeriod ? dto.dateTo! : '',
      totalSourceRows: activeBatch.totalSourceRows,
      matchedSourceRows: aggregate.matchedSourceRows,
      aggregatedRows: aggregate.rows.length,
      skippedRows: activeBatch.skippedRows,
      rows: aggregate.rows,
      warnings: [],
    };
  }

  private findHeaderRowIndex(rows: string[][]): number {
    return rows.findIndex((row) => {
      const normalizedRow = row.map((cell) => this.normalizeCellValue(cell));

      return (
        this.containsAnyAlias(normalizedRow, headerAliases.recipientName) &&
        this.containsAnyAlias(normalizedRow, headerAliases.issueDate) &&
        this.containsAnyAlias(normalizedRow, headerAliases.quantity) &&
        this.containsAnyAlias(normalizedRow, headerAliases.organizationName) &&
        this.containsAnyAlias(normalizedRow, headerAliases.recipientEmail) &&
        this.containsAnyAlias(normalizedRow, headerAliases.licensePurpose)
      );
    });
  }

  private resolveHeaderIndexes(row: string[]) {
    const normalizedRow = row.map((cell) => this.normalizeCellValue(cell));

    return {
      recipientName: this.findHeaderIndex(
        normalizedRow,
        headerAliases.recipientName,
        'ФИО получателя',
      ),
      issueDate: this.findHeaderIndex(normalizedRow, headerAliases.issueDate, 'Дата выдачи'),
      quantity: this.findHeaderIndex(normalizedRow, headerAliases.quantity, 'Количество'),
      organizationName: this.findHeaderIndex(
        normalizedRow,
        headerAliases.organizationName,
        'Наименование организации',
      ),
      recipientEmail: this.findHeaderIndex(
        normalizedRow,
        headerAliases.recipientEmail,
        'Адрес электронной почты',
      ),
      licensePurpose: this.findHeaderIndex(
        normalizedRow,
        headerAliases.licensePurpose,
        'Назначение лицензии/цель использования',
      ),
    };
  }

  private findHeaderIndex(
    normalizedRow: string[],
    aliases: readonly string[],
    headerLabel: string,
  ): number {
    const index = normalizedRow.findIndex((cell) => aliases.includes(cell));

    if (index === -1) {
      throw new BadRequestException(`Header "${headerLabel}" was not found in the registry`);
    }

    return index;
  }

  private containsAnyAlias(normalizedRow: string[], aliases: readonly string[]): boolean {
    return normalizedRow.some((cell) => aliases.includes(cell));
  }

  private readCell(row: string[], index: number): string {
    return (row[index] ?? '').replace(/\r/g, '').replace(/\n/g, ' ').trim();
  }

  private parseIsoDate(value: string): Date {
    const [yearPart, monthPart, dayPart] = value.split('-');
    const year = Number.parseInt(yearPart, 10);
    const month = Number.parseInt(monthPart, 10);
    const day = Number.parseInt(dayPart, 10);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ISO date: ${value}`);
    }

    return date;
  }

  private parseRegistryDate(value: string): Date | null {
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/);

    if (!match) {
      return null;
    }

    const [, dayPart, monthPart, yearPart] = match;
    const day = Number.parseInt(dayPart, 10);
    const month = Number.parseInt(monthPart, 10);
    const year =
      yearPart.length === 2 ? 2000 + Number.parseInt(yearPart, 10) : Number.parseInt(yearPart, 10);

    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  private canStopReverseScan(row: string[], issueDateIndex: number, dateFrom: Date): boolean {
    const issueDateRaw = this.readCell(row, issueDateIndex);

    if (!issueDateRaw) {
      return false;
    }

    const issueDate = this.parseRegistryDate(issueDateRaw);

    if (!issueDate) {
      return false;
    }

    return issueDate.getTime() < dateFrom.getTime();
  }

  private parseQuantity(value: string): number | null {
    const match = value.match(/\d+/);

    if (!match) {
      return null;
    }

    return Number.parseInt(match[0], 10);
  }

  private resolveIssuedTo(
    recipientName: string,
    organizationName: string,
    recipientEmail: string,
  ): string {
    if (recipientName && recipientName !== '-') {
      return recipientName;
    }

    if (organizationName && organizationName !== '-') {
      return organizationName;
    }

    if (recipientEmail && recipientEmail !== '-') {
      return recipientEmail;
    }

    return 'Unknown recipient';
  }

  private toNullableValue(value: string): string | null {
    if (!value || value === '-') {
      return null;
    }

    return value;
  }

  private normalizeCellValue(value: string): string {
    return value.replace(/\uFEFF/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  private isBlankRow(row: string[]): boolean {
    return row.every((cell) => this.normalizeCellValue(cell) === '');
  }
}
