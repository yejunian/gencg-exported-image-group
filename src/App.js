import { useState } from "react";

import * as tgaUtils from './tgaUtils';

function App() {
  const [images, setImages] = useState([]);

  const handleFileChange = async (event) => {
    const urls = await Promise.all(
      [...event.target.files].map(
        async (file) => new Promise(
          (resolve) => {
            const reader = new FileReader();
            reader.onload = async (progressEvent) => {
              const tga = await tgaUtils.openTga(progressEvent.target.result);
              resolve(...tgaUtils.changeFormat(tga, ['image/png']));
            };
            reader.readAsDataURL(file);
          }
        )
      )
    );

    setImages(urls);
  };

  return (
    <div>
      <h1>GenCG HD에서 추출한 이미지 PDF로 묶기</h1>

      <h2>1. 이미지 파일 선택</h2>
      <input
        type="file"
        accept="image/x-targa,image/x-tga"
        multiple={true}
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
        <li>PDF 크기: 640x360</li>
        <li>배경색: #808080</li>
        <li>PNG/JPG 자동 결정: 아니오(PNG 사용)</li>
        <li>페이지 번호 표시: 아니오</li>
      </ul>

      <hr />

      <h2>3. PDF 생성</h2>
      <button type="button">PDF 생성</button>
    </div>
  );
}

export default App;
