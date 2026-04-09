import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvLicenseRegistryParser {
  parse(csvContent: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let index = 0; index < csvContent.length; index += 1) {
      const character = csvContent[index];
      const nextCharacter = csvContent[index + 1];

      if (character === '"') {
        if (insideQuotes && nextCharacter === '"') {
          currentCell += '"';
          index += 1;
          continue;
        }

        insideQuotes = !insideQuotes;
        continue;
      }

      if (!insideQuotes && character === ',') {
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if (!insideQuotes && (character === '\n' || character === '\r')) {
        if (character === '\r' && nextCharacter === '\n') {
          index += 1;
        }

        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        continue;
      }

      currentCell += character;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    return rows;
  }
}
