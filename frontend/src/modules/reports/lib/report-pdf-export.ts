import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';

const PDF_PAGE_FORMAT = 'a4';
const PDF_PAGE_ORIENTATION = 'portrait';
const PDF_PAGE_UNIT = 'mm';
const PDF_MARGIN_X_MM = 6;
const PDF_MARGIN_Y_MM = 6;
const EXPORT_BACKGROUND_COLOR = '#edf4fb';
const EXPORT_PIXEL_RATIO = 1.25;
const EXPORT_IMAGE_QUALITY = 0.82;
const MIN_LINK_SIZE_MM = 0.8;

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
  const sectionLinks = collectSectionLinks(section, sourceCanvas);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = Math.max(1, pageWidth - PDF_MARGIN_X_MM * 2);
  const usableHeight = Math.max(1, pageHeight - PDF_MARGIN_Y_MM * 2);
  const pageHeightInPixels = Math.max(1, Math.floor((sourceCanvas.width * usableHeight) / usableWidth));
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
    const renderedPageHeight = (sliceHeight * usableWidth) / sourceCanvas.width;

    pdf.addImage(
      imageDataUrl,
      'JPEG',
      PDF_MARGIN_X_MM,
      PDF_MARGIN_Y_MM,
      usableWidth,
      renderedPageHeight,
      undefined,
      'MEDIUM',
    );

    addPageLinkOverlays(
      pdf,
      sectionLinks,
      sourceCanvas.width,
      sliceTop,
      sliceHeight,
      renderedPageHeight,
      usableWidth,
    );
  }
}

type SectionLink = {
  url: string;
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
};

function collectSectionLinks(section: HTMLElement, sourceCanvas: HTMLCanvasElement): SectionLink[] {
  const sectionRect = section.getBoundingClientRect();
  const sectionWidthCss = Math.max(sectionRect.width, 1);
  const sectionHeightCss = Math.max(sectionRect.height, 1);
  const scaleX = sourceCanvas.width / sectionWidthCss;
  const scaleY = sourceCanvas.height / sectionHeightCss;
  const links: SectionLink[] = [];

  section.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href')?.trim() ?? '';
    if (href === '' || href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }

    let url: string;
    try {
      url = new URL(href, window.location.origin).toString();
    } catch {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const widthCss = anchorRect.width;
    const heightCss = anchorRect.height;

    if (widthCss <= 0 || heightCss <= 0) {
      return;
    }

    links.push({
      url,
      xPx: (anchorRect.left - sectionRect.left) * scaleX,
      yPx: (anchorRect.top - sectionRect.top) * scaleY,
      widthPx: widthCss * scaleX,
      heightPx: heightCss * scaleY,
    });
  });

  return links;
}

function addPageLinkOverlays(
  pdf: jsPDF,
  links: SectionLink[],
  sectionWidthPx: number,
  sliceTopPx: number,
  sliceHeightPx: number,
  renderedPageHeightMm: number,
  usableWidthMm: number,
) {
  if (links.length === 0) {
    return;
  }

  const sectionScaleMmPerPx = usableWidthMm / sectionWidthPx;
  const pageScaleMmPerPx = renderedPageHeightMm / sliceHeightPx;

  links.forEach((link) => {
    const linkBottomPx = link.yPx + link.heightPx;
    const sliceBottomPx = sliceTopPx + sliceHeightPx;
    const visibleTopPx = Math.max(link.yPx, sliceTopPx);
    const visibleBottomPx = Math.min(linkBottomPx, sliceBottomPx);
    const visibleHeightPx = visibleBottomPx - visibleTopPx;

    if (visibleHeightPx <= 0) {
      return;
    }

    const xMm = PDF_MARGIN_X_MM + link.xPx * sectionScaleMmPerPx;
    const yMm = PDF_MARGIN_Y_MM + (visibleTopPx - sliceTopPx) * pageScaleMmPerPx;
    const widthMm = link.widthPx * sectionScaleMmPerPx;
    const heightMm = visibleHeightPx * pageScaleMmPerPx;

    if (widthMm < MIN_LINK_SIZE_MM || heightMm < MIN_LINK_SIZE_MM) {
      return;
    }

    pdf.link(xMm, yMm, widthMm, heightMm, { url: link.url });
  });
}
