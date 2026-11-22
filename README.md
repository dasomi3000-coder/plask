# 단어장

플래시카드 + 듣기(라디오) 단어장 웹앱. 빌드 없이 정적 파일만으로 동작합니다.

## 파일
- `index.html` 진입 페이지
- `style.css` 스타일
- `app.js` 앱 전체 로직
- `manifest.webmanifest`, `sw.js`, `icons/` 홈 화면 추가와 오프라인 사용을 위한 PWA 파일

## GitHub Pages로 배포
1. 이 폴더의 파일들을 저장소 루트에 그대로 올립니다.
2. 저장소 Settings → Pages → Source를 `Deploy from a branch`, Branch를 `main` / `(root)`로 설정합니다.
3. 잠시 후 `https://<계정>.github.io/<저장소>/` 로 접속됩니다.

## 휴대폰에서 쓰기
- 위 주소를 열고 브라우저 메뉴에서 "홈 화면에 추가"를 누르면 앱처럼 실행됩니다.
- 한 번 접속하면 서비스 워커가 파일을 저장해서 인터넷 없이도 열립니다.

## 참고
- 단어 데이터는 브라우저 `localStorage`에 저장됩니다. 기기와 브라우저마다 따로 저장되고, 사이트 데이터를 지우면 사라집니다.
- 코드를 수정해서 다시 배포할 때 반영이 안 되면 `sw.js`의 `flashcard-v1`을 `flashcard-v2`처럼 올려주세요.
- 듣기 기능은 브라우저 음성 합성(Web Speech API)을 사용합니다.
