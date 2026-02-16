/**
 * 사용량 추적 유틸리티 테스트
 */

import {
  getTodayUsage,
  checkUsageLimit,
  incrementUsage,
  cleanupOldUsageData,
  resetTodayUsage,
} from './usage-tracker';

describe('usage-tracker', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    // Mock Object.keys for cleanupOldUsageData
    const originalKeys = Object.keys;
    global.Object.keys = jest.fn((obj: unknown) => {
      if (obj === window.localStorage) {
        return originalKeys(mockLocalStorage);
      }
      return originalKeys(obj as object);
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
        key: jest.fn((index: number) => {
          return originalKeys(mockLocalStorage)[index] || null;
        }),
        get length() {
          return originalKeys(mockLocalStorage).length;
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock Date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTodayUsage', () => {
    it('오늘 날짜의 사용량을 반환한다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 3,
        advancedCount: 2,
      });

      const usage = getTodayUsage();

      expect(usage).toEqual({
        date: today,
        basicCount: 3,
        advancedCount: 2,
      });
    });

    it('저장된 데이터가 없으면 초기값을 반환한다', () => {
      const usage = getTodayUsage();
      const today = new Date().toISOString().split('T')[0];

      expect(usage).toEqual({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });
    });

    it('JSON 파싱 실패 시 초기값을 반환한다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = 'invalid json';

      const usage = getTodayUsage();

      expect(usage).toEqual({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });
    });
  });

  describe('checkUsageLimit - Premium 티어', () => {
    it('premium 티어는 항상 허용된다 (기본 기능)', () => {
      const result = checkUsageLimit('premium', false);

      expect(result).toEqual({
        allowed: true,
        remaining: 999,
        limit: 999,
      });
    });

    it('premium 티어는 항상 허용된다 (고급 기능)', () => {
      const result = checkUsageLimit('premium', true);

      expect(result).toEqual({
        allowed: true,
        remaining: 999,
        limit: 999,
      });
    });
  });

  describe('checkUsageLimit - Guest 티어', () => {
    it('guest 기본 기능 제한은 3회이다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });

      const result = checkUsageLimit('guest', false);

      expect(result).toEqual({
        allowed: true,
        remaining: 3,
        limit: 3,
      });
    });

    it('guest 고급 기능 제한은 3회이다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });

      const result = checkUsageLimit('guest', true);

      expect(result).toEqual({
        allowed: true,
        remaining: 3,
        limit: 3,
      });
    });

    it('guest 기본 기능 사용량이 제한에 도달하면 거부된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 2,
        advancedCount: 1, // 총 3회
      });

      const result = checkUsageLimit('guest', false);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        limit: 3,
        message: '오늘의 사용 횟수를 모두 사용했습니다. (3회/일)',
      });
    });

    it('guest 고급 기능 사용량이 제한에 도달하면 거부된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 3,
      });

      const result = checkUsageLimit('guest', true);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        limit: 3,
        message: '오늘의 고급 기능 사용 횟수를 모두 사용했습니다. (3회/일)',
      });
    });

    it('guest 기본 기능은 basicCount + advancedCount 합계로 계산된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 1,
        advancedCount: 1, // 총 2회 사용
      });

      const result = checkUsageLimit('guest', false);

      expect(result).toEqual({
        allowed: true,
        remaining: 1, // 3 - 2 = 1
        limit: 3,
      });
    });
  });

  describe('checkUsageLimit - Free 티어', () => {
    it('free 기본 기능 제한은 10회이다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });

      const result = checkUsageLimit('free', false);

      expect(result).toEqual({
        allowed: true,
        remaining: 10,
        limit: 10,
      });
    });

    it('free 고급 기능 제한은 5회이다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 0,
      });

      const result = checkUsageLimit('free', true);

      expect(result).toEqual({
        allowed: true,
        remaining: 5,
        limit: 5,
      });
    });

    it('free 기본 기능 사용량이 제한에 도달하면 거부된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 7,
        advancedCount: 3, // 총 10회
      });

      const result = checkUsageLimit('free', false);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        limit: 10,
        message: '오늘의 사용 횟수를 모두 사용했습니다. (10회/일)',
      });
    });

    it('free 고급 기능 사용량이 제한에 도달하면 거부된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 0,
        advancedCount: 5,
      });

      const result = checkUsageLimit('free', true);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        limit: 5,
        message: '오늘의 고급 기능 사용 횟수를 모두 사용했습니다. (5회/일)',
      });
    });

    it('free 기본 기능 제한을 초과하면 거부된다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 5,
        advancedCount: 6, // 총 11회 (초과)
      });

      const result = checkUsageLimit('free', false);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        limit: 10,
        message: '오늘의 사용 횟수를 모두 사용했습니다. (10회/일)',
      });
    });
  });

  describe('incrementUsage', () => {
    it('기본 기능 사용량을 1 증가시킨다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 2,
        advancedCount: 1,
      });

      incrementUsage(false);

      const stored = JSON.parse(mockLocalStorage[`sir_usage_${today}`]);
      expect(stored).toEqual({
        date: today,
        basicCount: 3,
        advancedCount: 1,
      });
    });

    it('고급 기능 사용량을 1 증가시킨다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 2,
        advancedCount: 1,
      });

      incrementUsage(true);

      const stored = JSON.parse(mockLocalStorage[`sir_usage_${today}`]);
      expect(stored).toEqual({
        date: today,
        basicCount: 2,
        advancedCount: 2,
      });
    });

    it('저장된 데이터가 없으면 초기화 후 증가시킨다', () => {
      const today = new Date().toISOString().split('T')[0];

      incrementUsage(false);

      const stored = JSON.parse(mockLocalStorage[`sir_usage_${today}`]);
      expect(stored).toEqual({
        date: today,
        basicCount: 1,
        advancedCount: 0,
      });
    });
  });

  describe('cleanupOldUsageData', () => {
    it('7일 이상 오래된 데이터를 삭제한다', () => {
      const today = new Date('2024-01-15');
      jest.setSystemTime(today);

      // 8일 전 데이터 (삭제 대상)
      const eightDaysAgo = new Date('2024-01-07');
      mockLocalStorage[`sir_usage_${eightDaysAgo.toISOString().split('T')[0]}`] = JSON.stringify({
        date: eightDaysAgo.toISOString().split('T')[0],
        basicCount: 5,
        advancedCount: 3,
      });

      // 6일 전 데이터 (유지)
      const sixDaysAgo = new Date('2024-01-09');
      mockLocalStorage[`sir_usage_${sixDaysAgo.toISOString().split('T')[0]}`] = JSON.stringify({
        date: sixDaysAgo.toISOString().split('T')[0],
        basicCount: 2,
        advancedCount: 1,
      });

      // 오늘 데이터 (유지)
      const todayStr = today.toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${todayStr}`] = JSON.stringify({
        date: todayStr,
        basicCount: 1,
        advancedCount: 0,
      });

      cleanupOldUsageData();

      expect(mockLocalStorage[`sir_usage_2024-01-07`]).toBeUndefined();
      expect(mockLocalStorage[`sir_usage_2024-01-09`]).toBeDefined();
      expect(mockLocalStorage[`sir_usage_${todayStr}`]).toBeDefined();
    });

    it('usage 키가 아닌 데이터는 삭제하지 않는다', () => {
      mockLocalStorage['other_key'] = 'value';
      mockLocalStorage['sir_other_key'] = 'value2';

      const eightDaysAgo = new Date('2024-01-07');
      mockLocalStorage[`sir_usage_${eightDaysAgo.toISOString().split('T')[0]}`] = JSON.stringify({
        date: eightDaysAgo.toISOString().split('T')[0],
        basicCount: 5,
        advancedCount: 3,
      });

      cleanupOldUsageData();

      expect(mockLocalStorage['other_key']).toBe('value');
      expect(mockLocalStorage['sir_other_key']).toBe('value2');
      expect(mockLocalStorage[`sir_usage_2024-01-07`]).toBeUndefined();
    });

    it('정확히 7일 전 데이터는 유지한다', () => {
      const today = new Date('2024-01-15');
      jest.setSystemTime(today);

      const sevenDaysAgo = new Date('2024-01-08');
      mockLocalStorage[`sir_usage_${sevenDaysAgo.toISOString().split('T')[0]}`] = JSON.stringify({
        date: sevenDaysAgo.toISOString().split('T')[0],
        basicCount: 5,
        advancedCount: 3,
      });

      cleanupOldUsageData();

      expect(mockLocalStorage[`sir_usage_2024-01-08`]).toBeDefined();
    });
  });

  describe('resetTodayUsage', () => {
    it('오늘 날짜의 사용량을 삭제한다', () => {
      const today = new Date().toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 5,
        advancedCount: 3,
      });

      resetTodayUsage();

      expect(mockLocalStorage[`sir_usage_${today}`]).toBeUndefined();
    });

    it('다른 날짜의 데이터는 삭제하지 않는다', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date('2024-01-14').toISOString().split('T')[0];

      mockLocalStorage[`sir_usage_${today}`] = JSON.stringify({
        date: today,
        basicCount: 5,
        advancedCount: 3,
      });
      mockLocalStorage[`sir_usage_${yesterday}`] = JSON.stringify({
        date: yesterday,
        basicCount: 2,
        advancedCount: 1,
      });

      resetTodayUsage();

      expect(mockLocalStorage[`sir_usage_${today}`]).toBeUndefined();
      expect(mockLocalStorage[`sir_usage_${yesterday}`]).toBeDefined();
    });
  });

  describe('통합 시나리오', () => {
    it('guest 사용자가 일일 제한까지 사용하는 시나리오', () => {
      // 초기 상태
      let result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);

      // 1회 사용
      incrementUsage(false);
      result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);

      // 2회 사용
      incrementUsage(false);
      result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);

      // 3회 사용
      incrementUsage(false);
      result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('free 사용자가 고급 기능을 제한까지 사용하는 시나리오', () => {
      // 초기 상태
      let result = checkUsageLimit('free', true);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);

      // 5회 연속 사용
      for (let i = 0; i < 5; i++) {
        incrementUsage(true);
      }

      result = checkUsageLimit('free', true);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toContain('고급 기능');
    });

    it('날짜가 바뀌면 사용량이 초기화된다', () => {
      const today = new Date('2024-01-15');
      jest.setSystemTime(today);

      // 오늘 3회 사용
      incrementUsage(false);
      incrementUsage(false);
      incrementUsage(false);

      let result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(false);

      // 다음 날
      const tomorrow = new Date('2024-01-16');
      jest.setSystemTime(tomorrow);

      result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it('리셋 후 다시 사용할 수 있다', () => {
      // 제한까지 사용
      incrementUsage(false);
      incrementUsage(false);
      incrementUsage(false);

      let result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(false);

      // 리셋
      resetTodayUsage();

      result = checkUsageLimit('guest', false);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it('cleanup은 오래된 데이터만 삭제하고 오늘 데이터는 유지한다', () => {
      const today = new Date('2024-01-15');
      jest.setSystemTime(today);

      // 오늘 사용량
      incrementUsage(false);
      incrementUsage(true);

      // 10일 전 데이터 추가
      const tenDaysAgo = new Date('2024-01-05').toISOString().split('T')[0];
      mockLocalStorage[`sir_usage_${tenDaysAgo}`] = JSON.stringify({
        date: tenDaysAgo,
        basicCount: 5,
        advancedCount: 3,
      });

      cleanupOldUsageData();

      // 오늘 데이터는 유지
      const usage = getTodayUsage();
      expect(usage.basicCount).toBe(1);
      expect(usage.advancedCount).toBe(1);

      // 10일 전 데이터는 삭제
      expect(mockLocalStorage[`sir_usage_${tenDaysAgo}`]).toBeUndefined();
    });
  });
});
