import { LicenseRegistryRecord } from '../model/license-registry';

type ExportLicenseRegistryParams = {
  rows: LicenseRegistryRecord[];
  fileName: string;
};

const licenseRegistryColumns = [
  'Дата',
  'Тип лицензии',
  'Количество',
  'Кому выдано',
  'Организация',
  'Email',
  'Комментарий',
] as const;

export function exportLicenseRegistryToExcel(params: ExportLicenseRegistryParams) {
  const xml = buildWorkbookXml(params.rows);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = params.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

function buildWorkbookXml(rows: LicenseRegistryRecord[]): string {
  const headerRow = `<Row>${licenseRegistryColumns
    .map((column) => buildStringCell(column))
    .join('')}</Row>`;

  const bodyRows = rows
    .map((row) => {
      return `<Row>${[
        buildStringCell(formatIssueDate(row.issueDate)),
        buildStringCell(row.licenseType.name),
        buildNumberCell(row.quantity),
        buildStringCell(row.issuedTo),
        buildStringCell(row.organizationName ?? '—'),
        buildStringCell(row.recipientEmail ?? '—'),
        buildStringCell(row.comment ?? '—'),
      ].join('')}</Row>`;
    })
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Реестр лицензий">
  <Table>
   ${headerRow}
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function buildStringCell(value: string): string {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function buildNumberCell(value: number): string {
  return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatIssueDate(issueDate: string): string {
  return new Date(`${issueDate}T00:00:00`).toLocaleDateString('ru-RU');
}
