/**
 * 게스트 세션 관리 테스트
 */

import { getGuestSessionId, clearGuestSession, hasGuestSession } from './guest-session';

describe('guest-session', () => {
  let mockSessionStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock sessionStorage
    mockSessionStorage = {};

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: jest.fn(() => {
          mockSessionStorage = {};
        }),
        key: jest.fn((index: number) => {
          return Object.keys(mockSessionStorage)[index] || null;
        }),
        get length() {
          return Object.keys(mockSessionStorage).length;
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock Date.now for consistent session ID generation
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000);

    // Mock Math.random for consistent session ID generation
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getGuestSessionId', () => {
    it('세션 ID가 없으면 새로 생성한다', () => {
      const sessionId = getGuestSessionId();

      expect(sessionId).toMatch(/^guest_\d+_[a-z0-9]+$/);
      expect(sessionId).toContain('guest_1234567890000_');
      expect(mockSessionStorage['guest_session_id']).toBe(sessionId);
    });

    it('이미 존재하는 세션 ID를 반환한다', () => {
      const existingId = 'guest_1234567890000_abc123xyz';
      mockSessionStorage['guest_session_id'] = existingId;

      const sessionId = getGuestSessionId();

      expect(sessionId).toBe(existingId);
      expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('생성된 세션 ID는 고유한 형식을 가진다', () => {
      const sessionId = getGuestSessionId();

      // guest_timestamp_randomstring 형식
      expect(sessionId).toMatch(/^guest_\d{13}_[a-z0-9]+$/);
    });

    it('여러 번 호출해도 같은 세션 ID를 반환한다', () => {
      const firstCall = getGuestSessionId();
      const secondCall = getGuestSessionId();
      const thirdCall = getGuestSessionId();

      expect(firstCall).toBe(secondCall);
      expect(secondCall).toBe(thirdCall);
    });

    it('sessionStorage에 저장된다', () => {
      const sessionId = getGuestSessionId();

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('guest_session_id', sessionId);
      expect(mockSessionStorage['guest_session_id']).toBe(sessionId);
    });
  });

  describe('clearGuestSession', () => {
    it('세션 ID를 삭제한다', () => {
      mockSessionStorage['guest_session_id'] = 'guest_1234567890000_abc123xyz';

      clearGuestSession();

      expect(mockSessionStorage['guest_session_id']).toBeUndefined();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('guest_session_id');
    });

    it('세션 ID가 없어도 에러가 발생하지 않는다', () => {
      expect(() => clearGuestSession()).not.toThrow();
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('guest_session_id');
    });

    it('삭제 후 다시 생성할 수 있다', () => {
      // 세션 생성
      const firstId = getGuestSessionId();
      expect(mockSessionStorage['guest_session_id']).toBe(firstId);

      // 세션 삭제
      clearGuestSession();
      expect(mockSessionStorage['guest_session_id']).toBeUndefined();

      // 다른 timestamp로 새로 생성
      jest.spyOn(Date, 'now').mockReturnValue(9876543210000);
      const secondId = getGuestSessionId();

      expect(secondId).toMatch(/^guest_9876543210000_/);
      expect(secondId).not.toBe(firstId);
    });
  });

  describe('hasGuestSession', () => {
    it('세션 ID가 있으면 true를 반환한다', () => {
      mockSessionStorage['guest_session_id'] = 'guest_1234567890000_abc123xyz';

      const result = hasGuestSession();

      expect(result).toBe(true);
    });

    it('세션 ID가 없으면 false를 반환한다', () => {
      const result = hasGuestSession();

      expect(result).toBe(false);
    });

    it('빈 문자열은 false로 간주한다', () => {
      mockSessionStorage['guest_session_id'] = '';

      const result = hasGuestSession();

      expect(result).toBe(false);
    });

    it('null은 false로 간주한다', () => {
      // sessionStorage.getItem이 null 반환하도록 설정
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = hasGuestSession();

      expect(result).toBe(false);
    });
  });

  describe('통합 시나리오', () => {
    it('전체 세션 라이프사이클이 정상 동작한다', () => {
      // 1. 초기에는 세션이 없음
      expect(hasGuestSession()).toBe(false);

      // 2. 세션 ID 생성
      const sessionId = getGuestSessionId();
      expect(sessionId).toMatch(/^guest_\d+_[a-z0-9]+$/);
      expect(hasGuestSession()).toBe(true);

      // 3. 같은 세션 ID 유지
      const sameSessionId = getGuestSessionId();
      expect(sameSessionId).toBe(sessionId);

      // 4. 세션 삭제
      clearGuestSession();
      expect(hasGuestSession()).toBe(false);

      // 5. 새 세션 생성
      jest.spyOn(Date, 'now').mockReturnValue(9999999999999);
      const newSessionId = getGuestSessionId();
      expect(newSessionId).not.toBe(sessionId);
      expect(hasGuestSession()).toBe(true);
    });

    it('여러 사용자가 각자의 세션을 가질 수 있다 (시뮬레이션)', () => {
      // 사용자 1
      jest.spyOn(Date, 'now').mockReturnValue(1111111111111);
      jest.spyOn(Math, 'random').mockReturnValue(0.111111111);
      const user1Session = getGuestSessionId();
      expect(user1Session).toMatch(/^guest_1111111111111_/);

      // 세션 클리어 (새 브라우저 탭 시뮬레이션)
      clearGuestSession();

      // 사용자 2
      jest.spyOn(Date, 'now').mockReturnValue(2222222222222);
      jest.spyOn(Math, 'random').mockReturnValue(0.222222222);
      const user2Session = getGuestSessionId();
      expect(user2Session).toMatch(/^guest_2222222222222_/);

      // 다른 세션 ID
      expect(user1Session).not.toBe(user2Session);
    });

    it('세션 존재 여부 확인은 실제 저장된 값을 기반으로 한다', () => {
      // 세션 생성
      getGuestSessionId();
      expect(hasGuestSession()).toBe(true);

      // 직접 삭제 (clearGuestSession을 사용하지 않고)
      delete mockSessionStorage['guest_session_id'];
      expect(hasGuestSession()).toBe(false);

      // 다시 생성
      getGuestSessionId();
      expect(hasGuestSession()).toBe(true);
    });

    it('세션 ID 형식이 일관되게 유지된다', () => {
      // 여러 번 생성해도 형식은 동일
      const sessions = [];

      for (let i = 0; i < 5; i++) {
        clearGuestSession();
        jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + i * 1000);
        jest.spyOn(Math, 'random').mockReturnValue(0.1 + i * 0.01);
        const sessionId = getGuestSessionId();
        sessions.push(sessionId);
      }

      // 모든 세션 ID가 올바른 형식
      sessions.forEach((sessionId) => {
        expect(sessionId).toMatch(/^guest_\d{13}_[a-z0-9]+$/);
      });

      // 모든 세션 ID가 고유함
      const uniqueSessions = new Set(sessions);
      expect(uniqueSessions.size).toBe(5);
    });
  });
});
