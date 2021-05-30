import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';

import * as tgaUtils from './tgaUtils';

const imageCompressionOptions = {
  maxWidthOrHeight: 960,
};

function App() {
  const [step, setStep] = useState('');
  const [completed, setCompleted] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [progressing, setProgressing] = useState(false);
  const [images, setImages] = useState([]);

  const handleFileChange = async (event) => {
    setProgressing(true);

    let completedCount = 0;
    setStep('TGA → PNG 변환(0%에서 오래 걸릴 수 있음)');
    setCompleted(0);
    setTargetCount(event.target.files.length);

    const urls = await Promise.all(
      [...event.target.files].map(
        async (file) => new Promise(
          (resolve) => {
            const reader = new FileReader();
            reader.onload = async (progressEvent) => {
              const tga = await tgaUtils.openTga(progressEvent.target.result);
              completedCount += 1;
              setCompleted(completedCount);
              resolve(tga.getDataURL('image/png'));
            };
            reader.readAsDataURL(file);
          }
        )
      )
    );

    setImages(urls);

    setProgressing(false);
  };

  const handleBuildClick = async () => {
    setProgressing(true);

    let completedCount = 0;
    setStep('이미지 축소 및 PDF 빌드');
    setCompleted(0);

    const compressed = await Promise.all(
      images.map(
        async (image) => {
          const file = await imageCompression.getFilefromDataUrl(image);
          const compressed = await imageCompression(file, imageCompressionOptions);
          completedCount += 1;
          setCompleted(completedCount);
          return imageCompression.getDataUrlFromFile(compressed);
        }
      )
    );

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [960, 540],
    });
    pdf.deletePage(1);

    compressed.forEach(
      (image, index) => pdf
        .addPage()
        .setFillColor('#808080')
        .rect(-10, -10, 980, 560, 'F')
        .addImage(image, 0, 0, 960, 540)
        .setFont('Helvetica', '', 'Bold')
        .setFontSize(54)
        .setLineWidth(8.1)
        .setDrawColor('#ffffff')
        .setTextColor('#000000')
        .text(String(index + 1), 912, 27, { align: 'right', baseline: 'top', renderingMode: 'stroke' })
        .text(String(index + 1), 912, 27, { align: 'right', baseline: 'top', renderingMode: 'fill' })
    );

    pdf.save();

    setProgressing(false);
  };

  return (
    <div>
      <h1>GenCG HD에서 추출한 이미지 PDF로 묶기</h1>
      {step && <div>{step}: {completed}/{targetCount}</div>}

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
        <li>PDF 크기: 960x540</li>
        <li>배경색: #808080</li>
        <li>PNG/JPG 자동 결정: 아니오(PNG 사용)</li>
        <li>페이지 번호 표시: 예</li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>
      <button
        type="button"
        disabled={progressing}
        onClick={handleBuildClick}
      >PDF 생성</button>
    </div>
  );
}

export default App;
