/**
 * E2E 테스트용 사용자 계정
 *
 * 주의: 여기서 사용되는 계정은 테스트용 계정입니다. 실제 프로덕션 계정을 사용하지 마세요!
 * 테스트 환경 전용 계정을 사용하거나, 환경 변수로 관리하세요.
 */

export const TEST_USERS = {
  // 일반 사용자 (Basic tier)
  basic: {
    email: process.env.TEST_USER_EMAIL || 'test-basic@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Test1234!',
  },

  // 프리미엄 사용자 (Premium tier)
  premium: {
    email: process.env.TEST_PREMIUM_EMAIL || 'test-premium@example.com',
    password: process.env.TEST_PREMIUM_PASSWORD || 'Test1234!',
  },
};

export const GUEST_MODE = {
  // 게스트 모드는 인증 없이 시작
  storageState: { cookies: [], origins: [] },
};
