import { useState } from 'react';

import buildAndDownloadPdf from './buildAndDownloadPdf';
import './App.css';

const fileCompareFunction = (a, b) => a.name < b.name ? -1 : 1; // `a.name !== b.name` is always `true`

function App() {
  const [task, setTask] = useState('');
  const [progressRatio, setProgressRatio] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);
  const [isProgressing, setIsProgressing] = useState(false);
  const [tgaFiles, setTgaFiles] = useState([]);
  const [pdfWidth, setPdfWidth] = useState(960);
  const [pdfHeight, setPdfHeight] = useState(540);
  const [pdfBackgroundColor, setPdfBackgroundColor] = useState('#5e5e5e');
  const [displayPageNumbers, setDisplayPageNumbers] = useState(true);
  const [filename, setFilename] = useState('generated');

  const updateProgressState = ({ task, progress }) => {
    if (typeof task === 'string') {
      setTask(task);
    }

    setProgressRatio(progress);
    setNow(new Date().getTime());
  };

  const convertImagesAndBuildPdfFile = async () => {
    setIsProgressing(true);
    setStartTime(new Date().getTime());

    updateProgressState({ task: '작업 시작', progress: 0 });

    await buildAndDownloadPdf(tgaFiles, {
      updateProgressState,
      displayPageNumbers,
      filename,
      width: pdfWidth,
      height: pdfHeight,
      backgroundColor: pdfBackgroundColor,
    });

    setIsProgressing(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (isProgressing || !event.dataTransfer.items) {
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
    if (event.target.files.length) {
      setTgaFiles([...event.target.files].sort(fileCompareFunction));
    }
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

      <a
        className="note-deprecated"
        href="https://yejunian.github.io/img-seq-pack/"
      >
        <h2>안내</h2>
        <p>
          처리가 더 빠르면서 다양한 이미지 포맷을 지원하는{' '}
          ‘<em>img-seq-pack</em>’을 사용하세요!
        </p>
      </a>

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
              disabled={isProgressing}
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
              disabled={isProgressing}
              onChange={handlePdfWidthChange}
            />
            <span className="gap">x</span>
            <input
              className="col2"
              type="number"
              value={pdfHeight}
              disabled={isProgressing}
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
            disabled={isProgressing}
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
              disabled={isProgressing}
              onChange={handleDisplayPageNumbers}
            />
          </label>
        </li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>

      <ul>
        <li>PDF 생성 완료 후에는 쾌적한 기기 사용을 위해 이 탭을 닫는 것을 권장합니다.</li>
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

          {task !== '' &&
            <>
              <progress
                className="col2"
                value={progressRatio}
                max={1}
              >
                {Math.floor(progressRatio * 100)}%
              </progress>
              <small className="col2">
                {(progressRatio * 100).toFixed(2)}%까지 {((now - startTime) / 1000).toFixed(1)}초 경과
              </small>
            </>}
        </li>
      </ul>
    </div>
  );
}

export default App;
