// Jest 테스트 환경 설정 파일
import '@testing-library/jest-dom';

// 전역 모의 객체 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 억제 (필요시 주석 해제)
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(), // 에러는 억제해서 테스트 결과를 깔끔하게
};

// Next.js 라우터 모의 객체
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// IntersectionObserver 모의 객체 (일부 컴포넌트에서 사용)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;
