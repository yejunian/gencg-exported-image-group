# gencg-exported-image-group

Convert TGA files exported by GenCG to single PDF file (Korean only supported)

GenCG에서 내보낸 TGA 파일을 단일 PDF 파일로 변환합니다. (한국어만 지원)

[https://leeye51456.github.io/gencg-exported-image-group/](https://leeye51456.github.io/gencg-exported-image-group/)

---

## 사용법

### 0. GenCG에서 TGA로 이미지 내보내기

1. **‘파일 - 그림으로 저장’** 메뉴(단축키 Alt+Shift+S)
2. 범위 지정 후 ‘OK’
   - **All**: 전체 범위
   - **Current Page**: 현재 페이지만
   - **Pages**: ‘Start Page’부터 ‘End Page’까지
3. ‘저장 위치’ 및 ‘파일 이름’(접두어) 지정
   - **저장 위치**: 프로그램이 별도의 하위 폴더를 만들어 주지 않고, ‘저장 위치’에 표시된 디렉터리에 그대로 이미지를 저장한다는 점에 주의하여 지정합니다.
   - **파일 이름**: 저장되는 이미지 파일의 접두어를 지정합니다. 파일 이름을 `파일명`으로 주었을 때 실제로 저장되는 파일 이름은 `파일명xxxxx.tga` 형태입니다.
   - **파일 형식**: 저장할 이미지 형식을 지정합니다. 여기서는 **TGA** 형식으로 지정합니다. (1920x1080, 32비트 기준으로 130페이지에 1GB 정도 나옵니다.)
4. 저장이 완료될 때까지 기다립니다. 페이지 수가 많으면 저장하는 데 수 초에서 수십 초까지도 걸릴 수 있습니다. 완료되면 별도의 메시지 없이, 프로그램 제목의 ‘응답 없음’ 상태가 풀리고 GenCG 프로그램 내에서 다른 동작을 수행할 수 있게 됩니다.

### 1. 이미지 파일 선택

[GenCG HD에서 추출한 이미지 PDF로 묶기](https://leeye51456.github.io/gencg-exported-image-group/) 페이지를 열고, 파일 선택 폼에서 앞서 저장한 TGA 파일을 모두 선택합니다. 파일을 어떤 순서로 선택하든지 파일명 순으로 처리됩니다. 파일을 다시 선택하면 이전에 선택한 파일 대신 새로 선택한 파일만 남습니다.

### 2. 출력 설정

결과물로 받을 PDF 설정을 변경합니다.

- **파일명**: 출력할 결과물의 파일명입니다. 기본값은 `generated.pdf`입니다.
- **PDF 크기**: 픽셀 단위로 입력합니다. 기본값은 960x540입니다.
- **배경색**: PDF 파일과 이미지의 배경색을 지정합니다. 기본값은 `#5e5e5e`입니다.
- **페이지 번호 표시**: 각 페이지에 페이지 번호를 표시합니다. 파일명에 관계없이 첫 파일이 1페이지입니다. 기본값은 ‘체크됨’입니다.

### 3. PDF 생성

선택한 이미지 파일과 설정을 토대로 PDF 파일을 생성합니다. 일반적으로 웹 브라우저에서 지정한 다운로드 폴더에, 지정한 파일명으로 저장됩니다. PDF 생성 완료 후에는 쾌적한 기기 사용을 위해 탭을 닫는 것을 권장합니다. 전원으로 배터리를 사용하는 경우 배터리 소모가 많을 수 있습니다.

3가지 환경에서 파일 로드부터 PDF 생성까지 걸리는 시간을 측정했을 때, 그 결과는 다음과 같았습니다. 시간 측정에 사용한 데이터는 1920x1080 크기의 무압축 32비트 TGA 파일 137개입니다.

- MacBook Pro 13" 2021 (M1, 16GB RAM): 50초
- MacBook Pro 15" 2019 (Intel i9 9980H, 16GB RAM): 62초
- Windows 데스크톱 (Intel i3 6100, 8GB RAM, SATA3 SSD): 70초

---

## 개발용 스크립트 설명<small>(Create React App에서 생성한 내용)</small>

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
