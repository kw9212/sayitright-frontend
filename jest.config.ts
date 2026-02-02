import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Next.js 앱의 경로 (next.config.ts가 있는 위치)
  dir: './',
});

// Jest에 전달할 커스텀 설정
const config: Config = {
  // 테스트 환경: jsdom (브라우저 환경 시뮬레이션)
  testEnvironment: 'jsdom',

  // 테스트 실행 전에 실행할 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 테스트 파일 찾기 패턴
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // 커버리지 수집 대상 (node_modules 제외)
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // 커버리지 목표치 (70% 이상)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 모듈 경로 별칭 (@/ -> src/)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 커버리지 리포트 형식
  coverageReporters: ['text', 'lcov', 'html'],
};

// Next.js 설정과 Jest 설정을 병합
export default createJestConfig(config);
