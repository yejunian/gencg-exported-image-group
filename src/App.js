import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';

import openTga from './openTga';

function App() {
  const [completedCount, setCompletedCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProgressing, setIsProgressing] = useState(false);
  const [tgaFiles, setTgaFiles] = useState([]);
  const [pdfWidth, setPdfWidth] = useState(960);
  const [pdfHeight, setPdfHeight] = useState(540);
  const [pdfBackgroundColor, setPdfBackgroundColor] = useState('#5e5e5e');
  const [displayPageNumbers, setDisplayPageNumbers] = useState(true);

  const handleFileChange = (event) => {
    setTgaFiles(
      [...event.target.files]
        .sort((a, b) => a.name < b.name ? -1 : 1) // `a.name !== b.name` is always `true`
    );
  };

  const handleBuildClick = async () => {
    setIsProgressing(true);
    const begin = new Date().getTime();

    let completedCountLocal = 0;
    setCompletedCount(0);
    setTargetCount(tgaFiles.length + 1);

    const images = await Promise.all(
      tgaFiles.map(
        async (file) => new Promise(
          (resolve) => {
            const reader = new FileReader();
            reader.onload = async (progressEvent) => {
              completedCountLocal += 0.34375; // -2, -4, -5; 0.01011
              setCompletedCount(completedCountLocal);
              setDuration(new Date().getTime() - begin);

              const tga = await openTga(progressEvent.target.result);

              completedCountLocal += 0.5625; // -1, -4; 0.1001
              setCompletedCount(completedCountLocal);
              setDuration(new Date().getTime() - begin);

              const tgaCanvas = tga.getCanvas();
              const canvas = document.createElement('canvas');
              canvas.width = tgaCanvas.width;
              canvas.height = tgaCanvas.height;

              const ctx = canvas.getContext('2d');
              ctx.fillStyle = pdfBackgroundColor;
              ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);
              ctx.drawImage(tgaCanvas, 0, 0, canvas.width, canvas.height);

              const png = await imageCompression.canvasToFile(canvas, 'image/png');
              const compressedPng = await imageCompression(png, { maxWidthOrHeight: Math.max(pdfWidth, pdfHeight) });
              const base64Png = await imageCompression.getDataUrlFromFile(compressedPng);

              const compressedJpg = await imageCompression(png, { maxWidthOrHeight: Math.max(pdfWidth, pdfHeight), initialQuality: 0.9, fileType: 'image/jpeg' });
              const base64Jpg = await imageCompression.getDataUrlFromFile(compressedJpg);

              const pageNumber = Number.parseInt(file.name.replace(/^\D*?(\d+)\.tga$/i, '$1'), 10);

              completedCountLocal += 0.09375; // -4, -5; 0.00011
              setCompletedCount(completedCountLocal);
              setDuration(new Date().getTime() - begin);

              if (base64Png.length - 22 <= (base64Jpg.length - 23) * 1.1) {
                resolve({ pageNumber, image: base64Png });
              } else {
                resolve({ pageNumber, image: base64Jpg });
              }
            };
            reader.readAsDataURL(file);
          }
        )
      )
    );

    const pdf = new jsPDF({
      orientation: pdfWidth >= pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
    });
    pdf.deletePage(1);

    const pdfShortSide = Math.min(pdfWidth, pdfHeight);
    images.forEach(
      ({ pageNumber, image }, index) => {
        pdf.addPage()
          .setFillColor(pdfBackgroundColor)
          .rect(-10, -10, pdfWidth + 20, pdfHeight + 20, 'F')
          .addImage(image, 0, 0, pdfWidth, pdfHeight);
        if (displayPageNumbers) {
          pdf.setFont('Helvetica', '', 'Bold')
            .setFontSize(pdfShortSide * 0.09375)
            .setLineWidth(pdfShortSide * 0.015625)
            .setDrawColor('#ffffff')
            .setTextColor('#000000')
            .text(
              String(pageNumber || (index + 1)),
              pdfWidth * 0.9375,
              pdfHeight * 0.0625,
              { align: 'right', baseline: 'top', renderingMode: 'stroke' },
            )
            .text(
              String(pageNumber || (index + 1)),
              pdfWidth * 0.9375,
              pdfHeight * 0.0625,
              { align: 'right', baseline: 'top', renderingMode: 'fill' },
            );
        }
      }
    );

    pdf.save();

    completedCountLocal += 1;
    setCompletedCount(completedCountLocal);
    setDuration(new Date().getTime() - begin);
    setIsProgressing(false);
  };

  const handleInputChangeWith = (setState) => (event) => setState(event.target.value);
  const handlePdfWidthChange = handleInputChangeWith(setPdfWidth);
  const handlePdfHeightChange = handleInputChangeWith(setPdfHeight);
  const handlePdfBackgroundColorChange = handleInputChangeWith(setPdfBackgroundColor);

  const handleCheckboxChangeWith = (setState) => (event) => setState(event.target.checked);
  const handleDisplayPageNumbers = handleCheckboxChangeWith(setDisplayPageNumbers)

  return (
    <div>
      <h1>GenCG HD에서 추출한 이미지 PDF로 묶기</h1>

      <h2>1. 이미지 파일 선택</h2>
      <input
        type="file"
        accept="image/x-targa,image/x-tga,.tga"
        multiple={true}
        disabled={isProgressing}
        onChange={handleFileChange}
      />
      <ul>
        <li>Windows에서는 마지막 파일을 먼저 선택한 뒤, Shift 키를 누른 채로 첫 파일을 클릭합니다.</li>
        <li>MacOS에서는 첫 파일을 먼저 선택한 뒤, Shift 키를 누른 채로 마지막 파일을 선택합니다.</li>
        <li>또는 전체 선택(Ctrl+A / {'\u2318'}A)로 현재 폴더의 모든 파일을 선택합니다.</li>
      </ul>

      <hr />

      <h2>2. 출력 설정</h2>
      <ul>
        <li>
          PDF 크기:{' '}
          <input
            type="number"
            value={pdfWidth}
            onChange={handlePdfWidthChange}
          />
          {' x '}
          <input
            type="number"
            value={pdfHeight}
            onChange={handlePdfHeightChange}
          />
        </li>
        <li>
          배경색:{' '}
          <input
            type="color"
            value={pdfBackgroundColor}
            onChange={handlePdfBackgroundColorChange}
          />
          {' ' + pdfBackgroundColor}
        </li>
        <li>페이지 번호 표시: <input type="checkbox" checked={displayPageNumbers} onChange={handleDisplayPageNumbers} /></li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>
      <ul>
        <li>아직 메모리 최적화가 안 되어서 메모리를 많이 사용합니다. PDF 생성 완료 후에는 쾌적한 기기 사용을 위해 탭을 닫는 것을 권장합니다.</li>
        <li>배터리를 사용하는 경우 배터리 소모가 많을 수 있습니다.</li>
      </ul>
      <p>
        <button
          type="button"
          disabled={isProgressing || tgaFiles.length === 0}
          onClick={handleBuildClick}
        >
          PDF 생성
        </button>
        {' '}
        {targetCount > 0 &&
          <>
            <progress value={completedCount} max={targetCount}>
              {Math.floor(completedCount / targetCount * 100)}%
            </progress>
            {' '}
            {(completedCount / targetCount * 100).toFixed(2)}%까지 {Math.floor(duration / 1000)}초 경과
          </>}
      </p>
    </div>
  );
}

export default App;
