import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry 프로젝트 설정 (소스맵 업로드용)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 소스맵을 빌드 후 자동 삭제 (번들에 포함되지 않도록)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // 빌드 로그 최소화
  silent: !process.env.CI,

  // Sentry SDK 자동 계측 비활성화 옵션
  automaticVercelMonitors: false,
});
