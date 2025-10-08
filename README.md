# AI Note App

AI의 도움을 받는 나만의 노트 정리 웹 애플리케이션

## 🚀 주요 기능

### 기본 기능
- **웹 기반 워드 프로세서**: 문서 작성, 서식 변경, 저장, 수정, 삭제
- **Tiptap 에디터**: 풍부한 텍스트 편집 기능
- **실시간 저장**: 자동 저장 및 수정 기능

### AI 핵심 기능
- **정보 요약**: 사용자가 탐색하는 주제에 대해 LLM이 정보를 요약하고 웹 검색을 통해 내용을 보강
- **브레인스토밍**: 사용자의 질문에 AI가 적극적으로 참여하여 아이디어를 확장
- **출판 형식 변환**: 작성된 문서를 전문적인 출판물 형태로 다듬어 줌

### 사용자 경험(UX)
- **분할 화면**: 좌측 본문과 우측 AI 메모 패널로 구성
- **AI 메모**: 본문과 분리된 공간에 깔끔하게 배치
- **연동 기능**: 본문 내용과 AI 메모를 쉽게 연결

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Tiptap**: 확장 가능한 리치 텍스트 에디터
- **Lucide React**: 아이콘 라이브러리

### 백엔드
- **FastAPI**: 현대적이고 빠른 Python 웹 프레임워크
- **SQLAlchemy**: Python SQL 툴킷 및 ORM
- **SQLite**: 개발용 데이터베이스 (PostgreSQL 지원)
- **Pydantic**: 데이터 검증 및 설정 관리

### AI 기능
- **OpenAI GPT**: 자연어 처리 및 생성
- **웹 검색 API**: 실시간 정보 수집
- **BeautifulSoup**: 웹 스크래핑

## 📁 프로젝트 구조

```
ai-note-app/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React 컴포넌트
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── lib/             # 유틸리티 함수
│   │   └── hooks/           # 커스텀 React 훅
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── api/             # API 라우터
│   │   ├── core/            # 핵심 설정 (DB, Config)
│   │   ├── models/          # SQLAlchemy 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── services/        # 비즈니스 로직
│   │   └── main.py          # FastAPI 앱
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <repository-url>
cd ai-note-app
```

### 2. 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```
프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 3. 백엔드 설정
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python -m app.main
```
백엔드는 `http://localhost:8000`에서 실행됩니다.

### 4. 환경 변수 설정
백엔드 폴더에 `.env` 파일을 생성하고 다음 내용을 추가:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./ai_note_app.db
DEBUG=True
```

## 📖 API 문서

백엔드 서버 실행 후 `http://localhost:8000/docs`에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

### 주요 엔드포인트
- `GET /api/v1/documents/` - 문서 목록 조회
- `POST /api/v1/documents/` - 새 문서 생성
- `GET /api/v1/documents/{id}` - 특정 문서 조회
- `POST /api/v1/ai-memos/generate` - AI 메모 생성
- `GET /api/v1/ai-memos/document/{document_id}` - 문서의 AI 메모 목록

## 🎯 사용 방법

1. **문서 작성**: 좌측 패널에서 Tiptap 에디터를 사용하여 문서 작성
2. **AI 도움 요청**: 우측 패널에서 원하는 AI 기능 선택
   - **요약**: 작성한 내용의 요약 및 관련 정보 제공
   - **브레인스토밍**: 주제에 대한 창의적인 아이디어 제안
   - **출판**: 전문적인 출판물 형태로 변환
3. **AI 메모 활용**: 생성된 AI 메모를 참고하여 문서 개선

## 🔧 개발 상태

### ✅ 완료된 기능
- [x] 프로젝트 구조 설정
- [x] Next.js + Tiptap 에디터 프론트엔드 기본 구조
- [x] FastAPI 백엔드 기본 구조 및 API 엔드포인트
- [x] 데이터베이스 스키마 및 모델 정의
- [x] Tiptap 에디터 기본 기능 (문서 작성, 서식 변경, 저장)
- [x] 분할 화면 UI 및 AI 메모 패널

### 🚧 진행 중인 기능
- [ ] AI 정보 요약 기능 (웹 검색 + LLM 요약)
- [ ] AI 브레인스토밍 기능
- [ ] 출판 형식 변환 기능

### 📋 향후 계획
- [ ] 사용자 인증 시스템
- [ ] 문서 공유 기능
- [ ] PDF/DOCX 내보내기
- [ ] 실시간 협업 기능
- [ ] 모바일 반응형 최적화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**AI Note App** - AI의 도움으로 더 스마트한 노트 작성 경험을 제공합니다! 🚀
