# SayItRight

AI 기반 이메일 작성 도우미 서비스

---

## 📌 프로젝트 개요

SayItRight는 상황에 맞는 적절한 이메일 문구를 AI가 생성해주는 서비스입니다.

### 주요 기능
- ✉️ **AI 이메일 생성**: OpenAI GPT를 활용한 상황별 이메일 작성
- 📝 **템플릿 관리**: 자주 사용하는 이메일 템플릿 저장
- 📦 **아카이브**: 생성한 이메일 히스토리 관리
- 📚 **표현/용어 노트**: 자주 쓰는 표현과 용어 정리
- 👥 **회원 등급**: 일반/프리미엄 회원 구분
- 🎭 **게스트 모드**: 로그인 없이 제한적으로 기능 체험

---

## 🏗️ 기술 스택

### 프론트엔드 (`sayitright-web`)
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React Query
- **UI 컴포넌트**: Radix UI, shadcn/ui

### 백엔드 (`sayitright-api`)
- **프레임워크**: NestJS
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **캐시**: Redis
- **인증**: JWT
- **AI**: OpenAI API
- **이메일**: Nodemailer

---

## 🚀 빠른 시작

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/sayitright.git
cd sayitright
```

#### 2. 백엔드 설정
```bash
cd sayitright-api

# 의존성 설치
npm install

# PostgreSQL & Redis 실행 (Docker Compose)
docker-compose up -d

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 값 입력

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run start:dev
```

백엔드는 `http://localhost:3001`에서 실행됩니다.

#### 3. 프론트엔드 설정
```bash
cd ../sayitright-web

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# 기본값으로 실행 가능

# 개발 서버 실행
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

---

## 📦 배포

### 빠른 배포 가이드
[QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) 참고 (15분 소요)

### 상세 배포 가이드
[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참고

### 배포 체크리스트
[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 참고

---

## 🔧 개발

### 프로젝트 구조
```
sayitright/
├── sayitright-web/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React 컴포넌트
│   │   ├── lib/             # 유틸리티, 설정
│   │   └── ...
│   └── ...
├── sayitright-api/          # NestJS 백엔드
│   ├── src/
│   │   ├── auth/            # 인증 모듈
│   │   ├── users/           # 사용자 모듈
│   │   ├── ai/              # AI 생성 모듈
│   │   ├── templates/       # 템플릿 모듈
│   │   ├── archives/        # 아카이브 모듈
│   │   └── ...
│   ├── prisma/              # DB 스키마
│   └── ...
└── README.md
```

### 주요 명령어

#### 백엔드
```bash
npm run start:dev    # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start:prod   # 프로덕션 서버 실행
npm run lint         # 린트 검사
npm run format       # 코드 포맷팅
npx prisma studio    # DB GUI 실행
```

#### 프론트엔드
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # 린트 검사
npm run format       # 코드 포맷팅
```

---

## 🌟 주요 기능 상세

### 1. 이메일 생성
- 초안 입력
- 관계, 목적, 톤 설정
- AI 기반 문맥 파악 및 생성
- 생성 이유 설명 (Rationale)
- 템플릿으로 저장 가능

### 2. 템플릿 관리
- 최대 3개 저장 (일반 회원)
- 무제한 (프리미엄 회원)
- 검색, 필터링
- 템플릿 재사용

### 3. 아카이브
- 생성 히스토리 자동 저장
- 7일 후 자동 삭제
- 템플릿으로 변환 가능
- 필터링 및 검색

### 4. 표현/용어 노트
- 자주 쓰는 표현 저장
- 별표 기능
- 검색 및 정렬

### 5. 게스트 모드
- IndexedDB 로컬 저장
- 일일 이메일 생성 3회
- 템플릿 1개, 아카이브 10개, 노트 5개
- IP 기반 rate limiting

---

## 🔐 보안

- JWT 기반 인증
- 이메일 인증 (회원가입 시)
- 비밀번호 bcrypt 해싱
- CORS 설정
- Rate limiting (게스트)
- 환경변수로 민감 정보 관리

---

## 📊 데이터베이스 스키마

주요 테이블:
- `User`: 사용자 정보
- `Archive`: 생성 이메일 히스토리
- `Template`: 저장된 템플릿
- `ExpressionNote`: 표현/용어 노트
- `EmailVerification`: 이메일 인증 코드

자세한 스키마는 `sayitright-api/prisma/schema.prisma` 참고

---

## 🧪 테스트

```bash
# 백엔드 테스트
cd sayitright-api
npm run test
npm run test:e2e

# 프론트엔드 테스트
cd sayitright-web
npm run test
```

---

## 📝 API 문서

백엔드 실행 후 Swagger UI 접속:
- 로컬: http://localhost:3001/api
- 프로덕션: https://api.your-domain.com/api

---

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

## 📞 문의

질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

## 🙏 감사의 말

- OpenAI for GPT API
- Vercel for hosting
- NestJS & Next.js communities
