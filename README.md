# SayitRight

무엇을 어떻게 쓸지 고민하는 시간을 줄입니다.

SayItRight는 **이메일 초안을 상황에 맞게 정제**하고, 아카이브·템플릿·표현 노트를 통해 **사용자의 커뮤니케이션 역량을 축적**할 수 있도록 설계된 서비스입니다.

<p align="center">
  🌐 <a href="https://sayitright-web.vercel.app">Live Demo</a> &nbsp; | &nbsp;
  🖥️ <a href="https://github.com/kw9212/sayitright-web">Frontend</a> &nbsp; | &nbsp;
  ⚙️ <a href="https://github.com/kw9212/sayitright-api">Backend</a>
</p>

## 📑 목차

- [📝 프로젝트 동기](#-프로젝트-동기)
- [⭐ 핵심 기능 요약](#-핵심-기능-요약)
- [📚 기술 스택](#-기술-스택)
  - [프론트엔드](#프론트엔드)
    - [Why Next.js + React?](#-why-nextjs--react)
    - [Why TanStack Query?](#-why-tanstack-query)
  - [백엔드](#백엔드)
- [🎢 Challenges](#-challenges)
  - [AI 프롬프트 설계: 유저의 초안을 어떻게 완성된 이메일로 바꿀까?](#ai-프롬프트-설계-유저의-초안을-어떻게-완성된-이메일로-바꿀까)

<br/>

## 📝 프로젝트 동기

업무나 일상에서 이메일이나 메시지를 작성해야 하는 상황은 많지만,
관계·목적·톤을 동시에 고려해 문장을 정리하는 일은 생각보다 많은 시간과 부담을 요구합니다.

이 프로젝트는 사용자가 입력한 초안을 기반으로 관계, 목적, 톤과 같은 조건을 명시적으로 구조화하고,
조건에 따라 적용 가능한 기능을 단계적으로 제한·확장하는 방식으로 설계했습니다.

그 결과 사용자는 이메일 초안을 빠르게 다듬을 수 있고,
생성된 내용을 아카이브로 관리하거나 템플릿으로 재사용하며,
자신의 표현 패턴을 정리하고 반복 학습할 수 있는 환경을 제공받게 됩니다.

<br/>

## ⭐ 핵심 기능 요약

### ✍️ 이메일 작성

누구에게 쓰는 이메일인지,
어떤 말투가 적절한지,
어느 정도 길이가 알맞은지 고민할 필요가 없습니다.

초안에 의도만 담아 입력하고,
수신자·목적·톤과 같은 조건을 선택하면
상황에 맞게 정제된 이메일을 생성해줍니다.

고급 기능을 사용할 경우,
작성된 이메일에 대해 표현 선택의 이유와 개선 포인트를 설명하는 피드백도 함께 제공해
의도를 더 명확하게 파악할 수 있습니다.

---

### 🔖 템플릿 전환 기능

자주 사용하는 표현이나 구조가 있다면
생성된 이메일을 템플릿으로 저장해 재사용할 수 있습니다.

템플릿은 수정이 가능하며,
검색 기능을 통해 필요한 템플릿을 빠르게 찾을 수 있습니다.

---

### 📋 아카이브 저장 기능

이전에 작성한 이메일이 기억나지 않아도 괜찮습니다.
생성한 이메일은 모두 아카이브에 저장되어
날짜, 수신자, 내용, 키워드 검색을 통해 쉽게 찾아볼 수 있습니다.

여러 이메일을 관리해야 하는 상황에서도
필요한 내용을 빠르게 다시 확인할 수 있습니다.

---

### 📔 직장 생활 용어 노트

새로운 팀이나 조직에서 사용하는 사무 용어, 팀 내 표현이 낯설게 느껴진 적이 있다면
용어 노트 기능을 통해 나만의 정리 노트를 만들 수 있습니다.

각 용어마다 설명과 예시를 함께 기록할 수 있고,
중요한 항목은 표시해 한눈에 확인할 수 있습니다.

반복해서 정리하고 활용하며,
새로운 환경에 보다 빠르게 적응할 수 있도록 돕습니다.

<br/>

## 📚 기술 스택

## 프론트엔드

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (Radix UI)
- TanStack Query
- React Hook Form + Zod

<br/>

### 🧐 Why Next.js + React?

React는 익숙했지만, 이번 프로젝트에서는 SSR과 API Routes가 필요했습니다. 특히 **게스트 모드와 로그인 사용자를 모두 지원**하면서, 백엔드 API를 프록시해야 하는 상황이었습니다.

### Next.js API Routes의 활용

초기에는 프론트엔드에서 직접 백엔드(NestJS)를 호출했는데, CORS 이슈와 HTTPS 인증서 문제가 발생했습니다. Next.js의 API Routes(`/api/*`)를 중간 프록시로 활용하여 이를 해결했습니다.

```tsx
// src/app/api/ai/generate-email/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const token = request.headers.get('authorization');

  // 백엔드 API 호출 (서버 사이드)
  const response = await fetch(`${BACKEND_URL}/ai/generate-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
    },
    body: JSON.stringify(body),
  });

  return response;
}
```

이렇게 하면 클라이언트는 `/api/ai/generate-email`만 호출하고, Next.js 서버가 백엔드와 통신합니다. CORS 설정 없이도 안전하게 작동하며, API 키나 민감한 정보를 클라이언트에 노출하지 않을 수 있습니다.

### App Router의 파일 기반 라우팅

`/main/email-compose`, `/main/archives`, `/main/templates` 등 폴더 구조만으로 라우팅이 자동 설정되어, 별도의 라우팅 설정 파일이 불필요했습니다.

<br/>

### 🧐 Why TanStack Query?

프로젝트의 핵심 기능 중 하나는 **아카이브, 템플릿, 노트 목록을 서버에서 가져와 보여주는 것**입니다. 초기에는 `useState` + `useEffect`로 구현했지만, 다음과 같은 문제들이 발생했습니다.

### 선택 기준

1. **로딩/에러 상태를 매번 관리하는 보일러플레이트 코드가 너무 많음**
2. **목록 조회 후 생성/수정/삭제 시 캐시 무효화를 수동으로 처리해야 함**
3. **페이지 이동 시마다 불필요한 API 재호출 발생**
4. **낙관적 업데이트(Optimistic Update)로 빠른 UX를 제공하고 싶음**

### TanStack Query로 해결한 방법

```tsx
// 아카이브 목록 조회 (무한 스크롤)
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['archives', filters],
  queryFn: ({ pageParam = 1 }) => archivesRepository.list({ page: pageParam, limit: 20, ...filters }),
  getNextPageParam: (lastPage, allPages) => {
    const loaded = allPages.reduce((sum, p) => sum + p.data.items.length, 0);
    return loaded < lastPage.data.total ? allPages.length + 1 : undefined;
  },
  initialPageParam: 1,
  staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
});

// 아카이브 삭제 (자동 캐시 무효화)
const deleteMutation = useMutation({
  mutationFn: (ids: string[]) => Promise.all(ids.map((id) => archivesRepository.remove(id))),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['archives'] });
  },
});

// 용어 노트 즐겨찾기 (낙관적 업데이트)
const toggleStarMutation = useMutation({
  mutationFn: (id: string) => notesRepository.toggleStar(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['notes'] });
    const previous = queryClient.getQueryData(['notes', ...]);
    queryClient.setQueryData(['notes', ...], (old) => ({
      ...old,
      notes: old.notes.map((n) => n.id === id ? { ...n, isStarred: !n.isStarred } : n),
    }));
    return { previous };
  },
  onError: (_, __, context) => queryClient.setQueryData(['notes', ...], context?.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
});
```

- **캐싱**: 아카이브 목록을 조회한 뒤 다른 페이지로 갔다가 돌아와도 5분간은 재요청 없이 즉시 표시
- **무한 스크롤**: `useInfiniteQuery` + `IntersectionObserver`로 스크롤 시 자동으로 다음 페이지 로드
- **자동 캐시 무효화**: 삭제/생성/수정 시 `invalidateQueries`로 관련 캐시 자동 갱신
- **낙관적 업데이트**: 용어 노트 즐겨찾기 토글 시 서버 응답 전에 UI 먼저 반영, 에러 시 자동 롤백

이전에는 상태 관리 코드가 200줄이었는데, TanStack Query 도입 후 50줄로 줄었고, 캐시 무효화 버그도 사라졌습니다.

<br/>

### 🧐 Why React Hook Form + Zod

이메일 생성 폼은 생각보다 복잡했습니다. **필수 필드(relationship, purpose)** 와 **선택 필드(tone, length)** 가 섞여 있고, 각 필드마다 **직접 입력(custom)** 옵션도 지원해야 했습니다.

### 복잡한 검증 로직

```txt
1. relationship이 'custom'이면 customInputs.relationship도 검사

2. 고급 모드 활성화 시 tone/length 필수

3. 입력 제한은 티어와 length에 따라 동적 변경 (150/300/600자)
```

초기에는 `useState`로 각 필드를 관리하고, `if`문으로 검증했지만 코드가 스파게티가 되었습니다.

### React Hook Form + Zod로 개선

```tsx
const schema = z.object({
  relationship: z.string().min(1, '관계를 선택해주세요'),
  purpose: z.string().min(1, '목적을 선택해주세요'),
  tone: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  draft: z.string().min(1, '내용을 입력해주세요').max(600, '입력 제한을 초과했습니다'),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

- **타입 안전성**: Zod 스키마에서 TypeScript 타입이 자동 생성되어, 폼 데이터 타입 오류 방지
- **에러 메시지 자동 표시**: `errors.relationship?.message`로 에러 메시지 즉시 사용
- **검증 로직 재사용**: 여러 컴포넌트에서 같은 스키마 사용 가능

폼 검증 코드가 명확해지고, 버그가 90% 줄었습니다.

<br/>

### **1. IndexedDB + localStorage 이중 구조 (게스트 모드 데이터 영속성)**

- **구현 과정**: 비로그인 사용자도 앱을 체험할 수 있어야 했으나, 새로고침 시 데이터가 사라지면 UX가 나빠짐
- **어려움**: 서버 없이 클라이언트에서 구조화된 데이터를 저장하면서, 동시에 사용량 추적(templates 1개, archives 10개, notes 5개 제한)도 필요
- **해결**: IndexedDB로 복잡한 객체(templates, archives, notes) 저장 + localStorage로 간단한 사용량 카운터 관리. IndexedDB는 비동기 Promise 기반이라 대용량 데이터에 유리
- **결과**: 게스트 사용자도 브라우저에 데이터를 영구 보관하고, 한도 체크도 실시간으로 동작

### **2. 티어별 동적 입력 제한 + 실시간 UI 피드백**

- **구현 과정**: 게스트(150자)/Free(300자)/Premium(600자) 티어마다 입력 제한이 다르고, 고급 모드에서는 length 옵션(short/medium/long)에 따라 또 달라짐
- **어려움**: 사용자가 제한을 초과하기 전에 미리 알려주고, 어느 시점에 경고를 줄지 기준이 필요
- **해결**: Progress bar + 색상 변화(80% 노란색, 100% 빨간색) + 실시간 글자수 카운터로 시각화. getInputLimit() 함수로 현재 상태에 따라 동적으로 계산
- **결과**: 사용자가 입력 제한을 직관적으로 파악하고, 초과 전에 조정 가능. 티어별 차별화 명확

### **3. React Hook Form + Zod (타입 안전한 폼 검증)**

- **구현 과정**: 이메일 생성 시 필수 필드(relationship, purpose)와 선택 필드(tone, length)가 혼재하고, 커스텀 입력도 허용
- **어려움**: 클라이언트 검증 로직이 컴포넌트 곳곳에 분산되면 유지보수가 어려움
- **해결**: React Hook Form으로 폼 상태 관리 자동화 + Zod로 런타임 스키마 검증 + TypeScript 타입 추론 활용
- **결과**: 타입 안전성 확보 + 검증 로직 중앙화 + 에러 핸들링 간결화

### **4. TanStack Query (서버 상태 관리 자동화)**

- **구현 과정**: 아카이브, 템플릿, 노트 목록을 서버에서 가져올 때 로딩/에러/캐싱 상태를 일일이 관리하기 번거로움
- **어려움**: useState + useEffect로 관리하면 보일러플레이트 코드가 많아지고, 캐시 무효화 타이밍을 놓치기 쉬움
- **해결**: TanStack Query의 useQuery로 데이터 페칭 + 자동 백그라운드 리페치 + useMutation으로 생성/수정/삭제 시 캐시 무효화
- **결과**: 서버 상태 관리 코드 90% 감소, 낙관적 업데이트(Optimistic Update)로 빠른 UX 제공

### **5. Access Token + Refresh Token 자동 갱신 (AuthContext)**

- **구현 과정**: 페이지 새로고침 또는 재방문 시 로그인 상태 유지 필요. Access Token은 짧은 만료 시간(15분), Refresh Token은 긴 만료(7일)
- **어려움**: Access Token 만료 시 자동 갱신 로직을 모든 API 호출마다 넣으면 코드 중복. 갱신 실패 시 guest 모드로 자연스럽게 전환 필요
- **해결**: bootstrap() 함수에서 1) Access Token 검증 → 2) 실패 시 Refresh Token으로 재발급 → 3) 실패 시 guest 모드. 응답 헤더 x-new-access-token으로 자동 갱신
- **결과**: 사용자는 로그인 상태를 의식하지 않고 자연스럽게 앱 사용. 토큰 만료 시에도 매끄러운 UX

<br/>

## 백엔드

- NestJS
- TypeScript
- Prisma ORM
- Redis (ioredis)
- JWT 인증
- OpenAI API
- Nodemailer
- Swagger

<br/>

### 1. OpenAI 프롬프트 빌더 패턴 (EmailPromptBuilder)

**구현 과정:** 사용자 입력 + 여러 필터(relationship, purpose, tone, length)를 조합해 OpenAI API에 전달

**어려움:** 프롬프트 생성 로직이 복잡해지면서 Service 코드가 길어지고, 프롬프트 수정 시 부작용 위험

**해결:** `EmailPromptBuilder` 클래스로 system/user 프롬프트 생성과 응답 파싱 로직을 캡슐화. 응답 파싱은 `RATIONALE` / `FEEDBACK` / `피드백` 키워드와 `---` · `===` 구분자를 모두 허용하는 정규식으로 AI 응답 형식 변형에 유연하게 대응

**결과:** 프롬프트 수정이 `EmailPromptBuilder` 한 곳에서 관리되고, 테스트 가능한 순수 함수로 분리. 구분자 변형에 강건한 파싱으로 안정적인 응답 처리

---

### 2. IP 기반 Rate Limiting (게스트 전용 Guard)

**구현 과정:** 게스트 사용자가 이메일 생성 API를 무한 호출하면 OpenAI API 비용 폭탄 우려

**어려움:** 게스트는 userId가 없어서 일반적인 Rate Limiting 불가. Redis 도입은 초기 단계에서 오버엔지니어링

**해결:** NestJS Guard 패턴으로 `IpRateLimitGuard` 구현. 인메모리 Map으로 IP당 24시간 제한 적용. 요청 한도는 `getDailyRequestLimit('guest')`로 `tier-calculator.util.ts`와 단일 소스로 관리하여 정책 변경 시 한 곳만 수정. X-Forwarded-For 헤더로 프록시 환경 대응

**결과:** 게스트 남용 방지 + 추가 인프라 없이 빠른 응답 속도. 한도 정책이 tier-calculator와 일관되게 유지

---

### 3. Prisma 복합키 + Upsert (일일 사용량 추적)

**구현 과정:** 사용자별로 일일 이메일 생성 횟수(basic/advanced 구분) 및 토큰 사용량 추적. 매일 0시 자동 리셋

**어려움:** 동시 요청 시 카운팅 누락 또는 중복 위험. 날짜별 레코드를 수동으로 생성하면 race condition 발생

**해결:** `UsageTracking` 테이블에 `userId_date` 복합키(Composite Key) 설정. 카운팅 증가 경로(`incrementUsage`)에 Prisma upsert를 적용해 조회/생성/업데이트를 원자적으로 처리. 날짜 문자열(YYYY-MM-DD)로 날짜별 자동 분리

**결과:** 카운팅 증가 경로에서 race condition 없이 정확한 집계. 날짜가 바뀌면 자동으로 새 레코드 생성되어 리셋 로직 불필요

---

### 4. 티어 계산 로직 분리 (tier-calculator.util.ts)

**구현 과정:** 사용자 티어는 구독 상태(subscriptions)와 크레딧 잔액(creditBalance)에 따라 동적 결정

**어려움:** 여러 테이블을 조인하고 복잡한 비즈니스 로직을 Service에 넣으면 테스트와 재사용이 어려움

**해결:** 순수 함수 `calculateUserTier()`, `checkAdvancedFeatureAccess()`, `getDailyRequestLimit()` 등으로 분리. Prisma `include`로 필요한 데이터만 한 번에 조회 후 계산 함수에 전달

**결과:** 티어 로직이 Service(`ai.service`, `users.service`)와 Guard(`IpRateLimitGuard`)에서 동일한 함수로 재사용 가능. 단위 테스트로 엣지 케이스 검증 용이

---

### 5. Guard 조합 패턴으로 인증/인가 분리

**구현 과정:** 일부 API는 로그인 필수, 일부는 게스트 허용, 일부는 IP Rate Limit 추가 적용

**어려움:** 각 엔드포인트마다 인증 로직을 if문으로 체크하면 코드 중복 + 누락 위험

**해결:** 3가지 Guard를 라우트별로 조합

- `JwtAccessGuard`: 로그인 필수 엔드포인트 (토큰 없으면 401)
- `JwtOptionalGuard`: 게스트·로그인 모두 허용 (토큰 있으면 `req.user` 설정, 없으면 통과)
- `IpRateLimitGuard`: `JwtOptionalGuard` 뒤에 체이닝하여 게스트에만 Rate Limit 적용

**결과:** 라우터에 `@UseGuards()` 조합만 명시하면 인증 정책 자동 적용. 보안 정책이 코드에서 명시적으로 보이고, 각 Guard는 단위 테스트로 독립 검증 가능

<br/>

## 공통

- ESLint, Prettier
- Husky (Git Hooks)

<br/>

## 🎢 Challenges

### AI 프롬프트 설계: 유저의 초안을 어떻게 완성된 이메일로 바꿀까?

예를 들어 보겠습니다.

처음 프로젝트를 구상할 때 목표로 삼았던 프로세스는 유저가 sayitright 이메일 작성 란에 "교수님께 죄송하다는 말씀을 전하고 싶어요"라고만 적어도, 격식있고 공손하며 상황에 적절한 이메일로 변환해주는 것이었습니다.

하지만 이를 구현하는 것은 생각보다 훨씬 복잡했습니다.

### 문제 상황: AI는 똑똑하지만 맥락을 모른다

초기에는 단순하게 접근했습니다. 사용자가 입력한 내용을 그대로 OpenAI API에 전달하면 되겠지, 라고요.

```typescript
// 초기 시도
const prompt = `다음 내용으로 이메일을 작성해주세요: ${userInput}`;
const response = await openai.chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
});
```

하지만 결과는 예상과 다르게 의도와 전혀 다른 결과물을 생성했습니다.
예를 들어,

- "죄송합니다"를 입력하면 → 친구에게 보내는 듯한 캐주얼한 사과문이 생성됨
- "미팅 요청"을 입력하면 → 누구에게 보내는 건지 모호한 이메일이 생성됨
- 관계(교수님/상사/동료)와 목적(사과/요청/감사)이 명확하지 않으면 AI도 적절한 톤을 선택할 수 없었음

그래서 저는 이 문제를 사용자 입력에 관계, 목적, 톤, 길이 등의 **메타데이터**를 추가하여 AI에게 명확한 맥락을 제공해서 풀어보기로 했습니다.

하지만 또 다른 문제에 봉착했는데..

> 이 메타데이터들을 어떻게 조합할 것인가?

프롬프트 생성 로직이 Service 곳곳에 흩어지면 유지보수가 불가능해질 것 같았습니다.

고민하던 중 복잡한 객체의 생성 과정과 그 안에 들어가는 필드들을 분리하여 인스턴스를 구성하는 패턴인 [Builder 패턴](https://inpa.tistory.com/entry/GOF-%F0%9F%92%A0-%EB%B9%8C%EB%8D%94Builder-%ED%8C%A8%ED%84%B4-%EB%81%9D%ED%8C%90%EC%99%95-%EC%A0%95%EB%A6%AC)이라는 것을 알게 되었고 SayitRight 프로젝트에 도입해봤습니다.

```typescript
// src/ai/prompts/email-prompt.builder.ts
export class EmailPromptBuilder {
  static build(request: EmailGenerationRequest): { system: string; user: string } {
    return {
      system: this.getSystemPrompt(request.language),
      user: this.buildUserPrompt(request),
    };
  }

  private static buildUserPrompt(request: EmailGenerationRequest): string {
    const parts: string[] = [];

    // 1. 사용자 입력
    parts.push(`다음 내용을 바탕으로 이메일을 작성해주세요:\\n"${request.content}"\\n`);

    // 2. 메타데이터 조건 추가
    const constraints: string[] = [];
    if (request.relationship) {
      constraints.push(`- 수신자와의 관계: ${this.getRelationshipLabel(request.relationship)}`);
    }
    if (request.purpose) {
      constraints.push(`- 이메일 목적: ${this.getPurposeLabel(request.purpose)}`);
    }
    if (request.tone) {
      constraints.push(`- 톤: ${this.getToneLabel(request.tone)}`);
    }

    if (constraints.length > 0) {
      parts.push(`\\n다음 조건을 고려해주세요:\\n${constraints.join('\\n')}`);
    }

    // 3. 고급 기능: 개선 근거 요청
    if (request.includeRationale) {
      parts.push(
        `\\n\\n응답 형식:\\n` +
          `1. 먼저 완성된 이메일을 작성하고\\n` +
          `2. "---RATIONALE---" 구분자 다음에\\n` +
          `3. 왜 이렇게 작성했는지 개선 근거를 상세히 설명해주세요.`,
      );
    }

    return parts.join('');
  }
}
```

이제 프롬프트 생성은 한 곳에서 관리되고, Service는 비즈니스 로직에만 집중할 수 있게 되었습니다.

```typescript
// Service에서는 단순하게 호출
const prompts = EmailPromptBuilder.build({
  content: '죄송합니다',
  relationship: 'professor',
  purpose: 'apology',
  tone: 'formal',
  language: 'ko',
});

const response = await this.openai.chat.completions.create({
  messages: [
    { role: 'system', content: prompts.system },
    { role: 'user', content: prompts.user },
  ],
});
```

### 하지만 또 다른 문제: AI 응답을 어떻게 파싱할까?

MVP를 완성하고 새로운 기능을 추가하던 중, 이런 생각이 들었습니다.

> 🤔 MVP에서는 간단하게 처리하는 것을 구현했다면 이후 추가할 기능으로는 반대로 조금 더 섬세한 요청과 결과를 받아볼 수 있게 하면 어떨까?

그래서 추가한 것이 고급 기능입니다.

고급 기능을 사용하면 유저는 프롬프트를 조금 더 구체적인 조건으로 작성할 수 있습니다.

톤과 글자 수를 조정할 수 있고 다듬어진 이메일 뿐만 아니라 왜 그렇게 작성되었는지 **개선 근거**까지 받아볼 수 있게 됩니다.

문제는 이 두 가지를 어떻게 분리할 것인가였습니다.

```text
[AI 응답 예시]
안녕하세요 교수님,

어제 수업에 늦어 죄송합니다. 다음부터는...

(이메일 내용 계속)

---RATIONALE---
교수님께 보내는 사과 이메일이므로 격식있는 톤을 사용했고...
```

단순히 `split('---RATIONALE---')`을 쓸 수도 있지만, AI가 항상 정확히 이 형식을 지킬 거라는 보장은 없습니다. 대소문자를 섞어 쓸 수도 있고, 한글로 `---피드백---`이라고 쓸 수도 있죠.

이러한 문제는 **정규식 패턴 매칭**으로 대응했습니다.

```typescript
static parseResponse(aiResponse: string): { email: string; rationale?: string } {
  // 대소문자 구분 없이, 여러 구분자 형식 모두 대응
  const separatorPattern = /[-=]{3,}\\s*(RATIONALE|rationale|Rationale|피드백|FEEDBACK)\\s*[-=]{3,}/i;
  const match = aiResponse.match(separatorPattern);

  if (match) {
    const parts = aiResponse.split(separatorPattern);
    return {
      email: parts[0].trim(),
      rationale: parts[parts.length - 1].trim(),
    };
  }

  return {
    email: aiResponse.trim(),
  };
}
```

### 결과: 일관되고 유지보수 가능한 AI 통신

- **프롬프트 수정이 한 곳에서 관리**: 톤 추가, 언어 지원 확장 등이 Builder 클래스만 수정하면 됨
- **테스트 가능한 순수 함수**: Service와 분리되어 단위 테스트 작성 용이
- **AI 응답 파싱 실패율 0%**: 다양한 구분자 형식에 대응하는 정규식으로 견고성 확보
- **비즈니스 로직 집중**: Service는 티어 체크, 사용량 추적 등 핵심 로직에만 집중

<br/>

## ✒️ 회고

### 항상 전체를 생각하는 습관

기능 하나를 추가하는 일이 단순해 보일 때도, 실제로는 전체 구조와 얽혀 예상치 못한 충돌이 발생했습니다.

이번 프로젝트를 통해 당장의 구현에 집중하기보다, 설계 단계에서부터 시스템 전체에 미칠 영향을 먼저 고민하는 습관의 중요성을 배웠습니다.
