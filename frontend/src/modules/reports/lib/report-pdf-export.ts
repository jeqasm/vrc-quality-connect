import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';

const PDF_PAGE_FORMAT = 'a4';
const PDF_PAGE_ORIENTATION = 'portrait';
const PDF_PAGE_UNIT = 'mm';
const EXPORT_BACKGROUND_COLOR = '#edf4fb';
const EXPORT_PIXEL_RATIO = 1.25;
const EXPORT_IMAGE_QUALITY = 0.82;

export async function exportHtmlElementToPdf(section: HTMLElement, fileName: string) {
  await exportHtmlSectionsToPdf([section], fileName);
}

export async function exportHtmlSectionsToPdf(
  sections: Array<HTMLElement | null>,
  fileName: string,
) {
  const exportableSections = sections.filter((section): section is HTMLElement => section !== null);

  if (exportableSections.length === 0) {
    return;
  }

  const pdf = new jsPDF({
    orientation: PDF_PAGE_ORIENTATION,
    unit: PDF_PAGE_UNIT,
    format: PDF_PAGE_FORMAT,
    compress: true,
  });

  let isFirstSection = true;

  for (const section of exportableSections) {
    if (!isFirstSection) {
      pdf.addPage();
    }

    await appendSectionToPdf(pdf, section, isFirstSection);
    isFirstSection = false;
  }

  pdf.save(fileName);
}

async function appendSectionToPdf(pdf: jsPDF, section: HTMLElement, isFirstPage: boolean) {
  const sourceCanvas = await toCanvas(section, {
    cacheBust: true,
    backgroundColor: EXPORT_BACKGROUND_COLOR,
    pixelRatio: EXPORT_PIXEL_RATIO,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageHeightInPixels = Math.max(1, Math.floor((sourceCanvas.width * pageHeight) / pageWidth));
  const totalPages = Math.max(1, Math.ceil(sourceCanvas.height / pageHeightInPixels));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    if (!isFirstPage || pageIndex > 0) {
      pdf.addPage();
    }

    const sliceTop = pageIndex * pageHeightInPixels;
    const sliceHeight = Math.min(pageHeightInPixels, sourceCanvas.height - sliceTop);
    const pageCanvas = document.createElement('canvas');

    pageCanvas.width = sourceCanvas.width;
    pageCanvas.height = sliceHeight;

    const pageContext = pageCanvas.getContext('2d');
    if (!pageContext) {
      throw new Error('Failed to create PDF export canvas context.');
    }

    pageContext.fillStyle = EXPORT_BACKGROUND_COLOR;
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(
      sourceCanvas,
      0,
      sliceTop,
      sourceCanvas.width,
      sliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    );

    const imageDataUrl = pageCanvas.toDataURL('image/jpeg', EXPORT_IMAGE_QUALITY);
    const renderedPageHeight = (sliceHeight * pageWidth) / sourceCanvas.width;

    pdf.addImage(imageDataUrl, 'JPEG', 0, 0, pageWidth, renderedPageHeight, undefined, 'MEDIUM');
  }
}
