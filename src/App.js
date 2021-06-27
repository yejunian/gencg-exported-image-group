import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';

import openTga from './openTga';

import './App.css';

const fileCompareFunction = (a, b) => a.name < b.name ? -1 : 1; // `a.name !== b.name` is always `true`

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
  const [filename, setFilename] = useState('generated');

  const convertImagesAndBuildPdfFile = async () => {
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

              const compressedJpg = await imageCompression(
                png,
                { maxWidthOrHeight: Math.max(pdfWidth, pdfHeight), initialQuality: 0.9, fileType: 'image/jpeg' },
              );
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

    pdf.save(`${filename}.pdf`);

    completedCountLocal += 1;
    setCompletedCount(completedCountLocal);
    setDuration(new Date().getTime() - begin);
    setIsProgressing(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  }

  const handleDrop = (event) => {
    event.preventDefault();

    if (!event.dataTransfer.items) {
      return;
    }

    const droppedTgaFiles = [...event.dataTransfer.items]
      .reduce((acc, item) => {
        if (item.kind !== 'file') {
          return acc;
        }

        const file = item.getAsFile();
        if (/image\/targa/i.test(file.type) || file.name.endsWith('.tga')) {
          acc.push(file);
        }
        return acc;
      }, [])
      .sort(fileCompareFunction);

    if (droppedTgaFiles.length) {
      setTgaFiles(droppedTgaFiles);
    }
  };

  const handleFileChange = (event) => {
    setTgaFiles([...event.target.files].sort(fileCompareFunction));
  };

  const handleBuildClick = async () => {
    await convertImagesAndBuildPdfFile();
  };

  const handleInputChangeWith = (setState) => (event) => setState(event.target.value);
  const handlePdfWidthChange = handleInputChangeWith(setPdfWidth);
  const handlePdfHeightChange = handleInputChangeWith(setPdfHeight);
  const handlePdfBackgroundColorChange = handleInputChangeWith(setPdfBackgroundColor);
  const handleFilenameChange = handleInputChangeWith(setFilename);

  const handleCheckboxChangeWith = (setState) => (event) => setState(event.target.checked);
  const handleDisplayPageNumbers = handleCheckboxChangeWith(setDisplayPageNumbers)

  return (
    <div
      className="App"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h1>GenCG HD에서 추출한 이미지 PDF로 묶기</h1>

      <h2>1. 이미지 파일 선택</h2>

      <div>
        <input
          type="file"
          accept="image/x-targa,image/x-tga,.tga"
          multiple={true}
          disabled={isProgressing}
          onChange={handleFileChange}
        />
      </div>

      <h3 style={{ marginBottom: '0.25rem' }}>
        * 파일 {tgaFiles.length}개 선택됨
      </h3>
      <ol className="file-list" style={{ marginTop: '0.25rem' }}>
        {tgaFiles.map((file) => <li key={file.name}>{file.name}</li>)}
      </ol>

      <hr />

      <h2>2. 출력 설정</h2>

      <ul className="rows">
        <li>
          <span className="col2">파일명</span>
          <span className="colgroup">
            <input
              className="col2"
              type="text"
              value={filename}
              onChange={handleFilenameChange}
            />
            <small>.pdf</small>
          </span>
        </li>

        <li>
          <span className="col2">PDF 크기</span>
          <span className="colgroup">
            <input
              className="col2"
              type="number"
              value={pdfWidth}
              onChange={handlePdfWidthChange}
            />
            <span className="gap">x</span>
            <input
              className="col2"
              type="number"
              value={pdfHeight}
              onChange={handlePdfHeightChange}
            />
          </span>
        </li>

        <li>
          <span className="col2">배경색</span>
          <input
            className="col2"
            type="color"
            value={pdfBackgroundColor}
            onChange={handlePdfBackgroundColorChange}
          />
          <small className="col2">{pdfBackgroundColor}</small>
        </li>

        <li>
          <span className="col2">페이지 번호 표시</span>
          <label className="col4">
            <input
              type="checkbox"
              checked={displayPageNumbers}
              onChange={handleDisplayPageNumbers}
            />
          </label>
        </li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>

      <ul>
        <li>
          아직 메모리 최적화가 안 되어서 메모리를 많이 사용합니다.
          PDF 생성 완료 후에는 쾌적한 기기 사용을 위해 탭을 닫는 것을 권장합니다.
        </li>
        <li>배터리를 사용하는 경우 배터리 소모가 많을 수 있습니다.</li>
      </ul>

      <ul className="rows">
        <li>
          <button
            className="col2"
            type="button"
            disabled={isProgressing || tgaFiles.length === 0}
            onClick={handleBuildClick}
          >
            PDF 생성
          </button>

          {targetCount > 0 &&
            <>
              <progress
                className="col2"
                value={completedCount}
                max={targetCount}
              >
                {Math.floor(completedCount / targetCount * 100)}%
              </progress>
              <small className="col2">
                {(completedCount / targetCount * 100).toFixed(2)}%까지 {Math.floor(duration / 1000)}초 경과
              </small>
            </>}
        </li>
      </ul>
    </div>
  );
}

export default App;
