import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';

import openTga from './openTga';

function App() {
  const [step, setStep] = useState('');
  const [completed, setCompleted] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [progressing, setProgressing] = useState(false);
  const [tgaFiles, setTgaFiles] = useState([]);
  const [pdfWidth, setPdfWidth] = useState(640);
  const [pdfHeight, setPdfHeight] = useState(360);
  const [pdfBackgroundColor, setPdfBackgroundColor] = useState('#5e5e5e');

  const handleFileChange = async (event) => {
    setTgaFiles([...event.target.files]);
  };

  const handleBuildClick = async () => {
    setProgressing(true);

    let completedCount = 0;
    setStep('[1/2] TGA 로드 및 PNG 변환');
    setCompleted(0);
    setTargetCount(tgaFiles.length * 2); // 2 phase: Load TGA -> Convert to PNG

    const images = await Promise.all(
      tgaFiles.map(
        async (file) => new Promise(
          (resolve) => {
            const reader = new FileReader();
            reader.onload = async (progressEvent) => {
              completedCount += 1; // Load TGA
              setCompleted(completedCount);

              const tga = await openTga(progressEvent.target.result);
              const png = tga.getDataURL('image/png');

              completedCount += 1; // Convert to PNG
              setCompleted(completedCount);

              resolve(png);
            };
            reader.readAsDataURL(file);
          }
        )
      )
    );

    completedCount = 0;
    setStep('[2/2] 이미지 축소 및 PDF 빌드');
    setCompleted(0);
    setTargetCount(images.length);

    const compressed = await Promise.all(
      images.map(
        async (image) => {
          const file = await imageCompression.getFilefromDataUrl(image);
          const compressed = await imageCompression(file, { maxWidthOrHeight: Math.max(pdfWidth, pdfHeight) });
          completedCount += 1;
          setCompleted(completedCount === targetCount ? targetCount - 1 : completedCount);
          return imageCompression.getDataUrlFromFile(compressed);
        }
      )
    );

    const pdf = new jsPDF({
      orientation: pdfWidth >= pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
    });
    pdf.deletePage(1);

    const pdfShortSide = Math.min(pdfWidth, pdfHeight);
    compressed.forEach(
      (image, index) => pdf
        .addPage()
        .setFillColor(pdfBackgroundColor)
        .rect(-10, -10, pdfWidth + 20, pdfHeight + 20, 'F')
        .addImage(image, 0, 0, pdfWidth, pdfHeight)
        .setFont('Helvetica', '', 'Bold')
        .setFontSize(pdfShortSide * 0.09375)
        .setLineWidth(pdfShortSide * 0.015625)
        .setDrawColor('#ffffff')
        .setTextColor('#000000')
        .text(String(index + 1), pdfWidth * 0.9375, pdfHeight * 0.0625, { align: 'right', baseline: 'top', renderingMode: 'stroke' })
        .text(String(index + 1), pdfWidth * 0.9375, pdfHeight * 0.0625, { align: 'right', baseline: 'top', renderingMode: 'fill' })
    );

    setCompleted(targetCount);
    pdf.save();

    setProgressing(false);
  };

  const handleInputChangeWith = (setState) => (event) => setState(event.target.value);

  const handlePdfWidthChange = handleInputChangeWith(setPdfWidth);
  const handlePdfHeightChange = handleInputChangeWith(setPdfHeight);
  const handlePdfBackgroundColorChange = handleInputChangeWith(setPdfBackgroundColor);

  return (
    <div>
      <h1>GenCG HD에서 추출한 이미지 PDF로 묶기</h1>

      <h2>1. 이미지 파일 선택</h2>
      <input
        type="file"
        accept="image/x-targa,image/x-tga"
        multiple={true}
        disabled={progressing}
        onChange={handleFileChange}
      />
      <ul>
        <li>Windows에서는 마지막 파일을 먼저 선택한 뒤, Shift 키를 누른 채로 첫 파일을 클릭합니다.</li>
        <li>MacOS에서는 첫 파일을 먼저 선택한 뒤, Shift 키를 누른 채로 마지막 파일을 선택합니다.</li>
      </ul>

      <hr />

      <h2>2. 출력 설정</h2>
      <p>기본 출력 설정은 다음과 같습니다.</p>
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
        <li>PNG/JPG 자동 결정: 아니오(PNG 사용)</li>
        <li>페이지 번호 표시: 예</li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>
      <p>
        <button
          type="button"
          disabled={progressing}
          onClick={handleBuildClick}
        >
          PDF 생성
        </button> {step && targetCount > 0 &&
          <progress value={completed} max={targetCount}>
            {Math.floor(completed / targetCount * 100)}%
          </progress>}
      </p>
      {step && targetCount > 0 && <p>{step} ({Math.floor(completed / targetCount * 100)}%)</p>}
    </div>
  );
}

export default App;
