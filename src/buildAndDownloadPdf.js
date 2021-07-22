import jsPDF from 'jspdf';

import readAndConvertImage from './readAndConvertImage';

async function buildAndDownloadPdf(files, options) {
  options = setupOptions(options);

  const pdf = new jsPDF({
    orientation: options.width >= options.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [options.width, options.height],
  });
  pdf.deletePage(1);

  const pdfShortSide = Math.min(options.width, options.height);
  const length = files.length;

  for (let index = 0; index < length; index += 1) {
    const { pageNumber, imageData } = await readAndConvertImage(files[index], options);

    pdf.addPage()
      .setFillColor(options.backgroundColor)
      .rect(-10, -10, options.width + 20, options.height + 20, 'F')
      .addImage(imageData, 0, 0, options.width, options.height);

    if (options.displayPageNumbers) {
      pdf.setFont('Helvetica', '', 'Bold')
        .setFontSize(pdfShortSide * 0.09375)
        .setLineWidth(pdfShortSide * 0.015625)
        .setDrawColor('#ffffff')
        .setTextColor('#000000')
        .text(
          String(pageNumber || (index + 1)),
          options.width * 0.9375,
          options.height * 0.0625,
          { align: 'right', baseline: 'top', renderingMode: 'stroke' },
        )
        .text(
          String(pageNumber || (index + 1)),
          options.width * 0.9375,
          options.height * 0.0625,
          { align: 'right', baseline: 'top', renderingMode: 'fill' },
        );
    }

    options.updateProgressState({ task: '이미지 변환 및 PDF 페이지 생성', progress: (index + 1) / length });
  }

  pdf.save(`${options.filename}.pdf`);
}

function setupOptions(options) {
  const result = {};

  result.updateProgressState = typeof options.updateProgressState === 'function'
    ? options.updateProgressState
    : () => {};
  result.displayPageNumbers = typeof options.displayPageNumbers === 'boolean' ? options.displayPageNumbers : false;
  result.filename = typeof options.filename === 'string' ? options.filename : 'generated';
  result.backgroundColor = typeof options.backgroundColor === 'string' ? options.backgroundColor : '#5e5e5e';
  result.width = options.width > 0 && options.width !== Infinity ? Math.floor(options.width) : 960;
  result.height = options.height > 0 && options.height !== Infinity ? Math.floor(options.height) : 540;

  return result;
}

export default buildAndDownloadPdf;
