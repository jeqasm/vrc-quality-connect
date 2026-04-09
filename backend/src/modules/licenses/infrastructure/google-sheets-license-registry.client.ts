import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleSheetsLicenseRegistryClient {
  constructor(private readonly configService: ConfigService) {}

  async downloadRegistryCsv(): Promise<string> {
    const registrySheetUrl = this.configService.get<string>('licenses.registrySheetUrl');
    const registrySheetName = this.configService.get<string>('licenses.registrySheetName');

    if (!registrySheetUrl) {
      throw new BadRequestException('LICENSE_REGISTRY_SHEET_URL is not configured');
    }

    if (!registrySheetName) {
      throw new BadRequestException('LICENSE_REGISTRY_SHEET_NAME is not configured');
    }

    const exportUrl = this.buildExportUrl(registrySheetUrl, registrySheetName);
    const response = await fetch(exportUrl);

    if (!response.ok) {
      throw new BadGatewayException(
        `Failed to download license registry: ${response.status} ${response.statusText}`,
      );
    }

    const csvBuffer = await response.arrayBuffer();
    return new TextDecoder('utf-8').decode(csvBuffer);
  }

  private buildExportUrl(sheetUrl: string, sheetName: string): string {
    const documentIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([^/]+)/);

    if (!documentIdMatch) {
      throw new BadRequestException('LICENSE_REGISTRY_SHEET_URL must be a valid Google Sheets URL');
    }

    const documentId = documentIdMatch[1];
    const searchParams = new URLSearchParams({
      format: 'csv',
      sheet: sheetName,
    });

    return `https://docs.google.com/spreadsheets/d/${documentId}/export?${searchParams.toString()}`;
  }
}
