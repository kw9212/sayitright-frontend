import { tokenStore } from './token';

describe('token 유틸리티', () => {
  // 각 테스트 전에 sessionStorage를 초기화
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getAccessToken', () => {
    it('저장된 토큰이 없으면 null을 반환한다', () => {
      const token = tokenStore.getAccessToken();
      expect(token).toBeNull();
    });

    it('저장된 토큰을 정확히 가져온다', () => {
      // Given: 토큰을 먼저 저장하고
      sessionStorage.setItem('access_token', 'test-token-123');

      // When: 토큰을 가져오면
      const token = tokenStore.getAccessToken();

      // Then: 저장한 토큰이 반환된다
      expect(token).toBe('test-token-123');
    });
  });

  describe('setAccessToken', () => {
    it('토큰을 sessionStorage에 저장한다', () => {
      // When: 토큰을 저장하면
      tokenStore.setAccessToken('my-access-token');

      // Then: sessionStorage에서 토큰을 읽을 수 있다
      const storedToken = sessionStorage.getItem('access_token');
      expect(storedToken).toBe('my-access-token');
    });

    it('기존 토큰을 덮어쓴다', () => {
      // Given: 기존 토큰이 있고
      tokenStore.setAccessToken('old-token');

      // When: 새 토큰을 저장하면
      tokenStore.setAccessToken('new-token');

      // Then: 새 토큰으로 교체된다
      const token = tokenStore.getAccessToken();
      expect(token).toBe('new-token');
    });

    it('빈 문자열도 저장할 수 있다', () => {
      tokenStore.setAccessToken('');
      const token = tokenStore.getAccessToken();
      expect(token).toBe('');
    });
  });

  describe('clearAccessToken', () => {
    it('저장된 토큰을 삭제한다', () => {
      // Given: 토큰이 저장되어 있고
      tokenStore.setAccessToken('token-to-delete');
      expect(tokenStore.getAccessToken()).toBe('token-to-delete');

      // When: 토큰을 삭제하면
      tokenStore.clearAccessToken();

      // Then: 토큰이 null이 된다
      expect(tokenStore.getAccessToken()).toBeNull();
    });

    it('토큰이 없어도 에러 없이 실행된다', () => {
      // Given: 토큰이 없는 상태에서

      // When/Then: clearAccessToken을 호출해도 에러가 발생하지 않는다
      expect(() => {
        tokenStore.clearAccessToken();
      }).not.toThrow();
    });
  });

  describe('통합 시나리오 테스트', () => {
    it('로그인 -> 토큰 확인 -> 로그아웃 플로우가 동작한다', () => {
      // 1. 로그인: 토큰 저장
      tokenStore.setAccessToken('user-session-token');
      expect(tokenStore.getAccessToken()).toBe('user-session-token');

      // 2. API 호출 시 토큰 사용
      const tokenForApi = tokenStore.getAccessToken();
      expect(tokenForApi).not.toBeNull();

      // 3. 로그아웃: 토큰 삭제
      tokenStore.clearAccessToken();
      expect(tokenStore.getAccessToken()).toBeNull();
    });

    it('여러 번 토큰을 갱신할 수 있다', () => {
      // 토큰 갱신 시나리오 (예: refresh token으로 새 access token 발급)
      tokenStore.setAccessToken('token-v1');
      expect(tokenStore.getAccessToken()).toBe('token-v1');

      tokenStore.setAccessToken('token-v2');
      expect(tokenStore.getAccessToken()).toBe('token-v2');

      tokenStore.setAccessToken('token-v3');
      expect(tokenStore.getAccessToken()).toBe('token-v3');
    });
  });
});
