import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션 환경에서만 에러 수집
  enabled: process.env.NODE_ENV === 'production',

  // 샘플링 비율 (1.0 = 100%)
  tracesSampleRate: 1.0,

  // 소스맵으로 실제 코드 위치 표시
  // Vercel 배포 시 자동으로 소스맵 업로드됨
  debug: false,
});
