import { waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import { tokenStore } from './token';

// tokenStore 모킹
jest.mock('./token', () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
    clearAccessToken: jest.fn(),
  },
}));

// fetch 모킹
global.fetch = jest.fn();

describe('auth-context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    sessionStorage.clear();
  });

  describe('useAuth Hook', () => {
    it('AuthProvider 없이 사용하면 에러를 던진다', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleError.mockRestore();
    });

    it('AuthProvider 내부에서 사용하면 정상 동작한다', () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.status).toBe('loading');
    });
  });

  describe('bootstrap() - 초기 인증 상태 확인', () => {
    it('토큰이 없으면 refresh를 시도하고 실패 시 guest 상태가 된다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
    });

    it('유효한 토큰이 있으면 사용자 정보를 가져온다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'tester',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => null,
        },
        json: async () => ({
          ok: true,
          data: mockUser,
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe('valid-token');
    });

    it('토큰이 만료되면 refresh로 새 토큰을 받는다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');

      (global.fetch as jest.Mock)
        // 1. /api/users/me 실패 (만료된 토큰)
        .mockResolvedValueOnce({
          ok: false,
          headers: {
            get: () => null,
          },
          json: async () => ({ ok: false }),
        })
        // 2. /api/auth/refresh 성공
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { accessToken: 'new-token' },
          }),
        })
        // 3. /api/users/me 성공 (새 토큰)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      expect(tokenStore.setAccessToken).toHaveBeenCalledWith('new-token');
      expect(result.current.user).toEqual(mockUser);
    });

    it('x-new-access-token 헤더가 있으면 토큰을 갱신한다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('old-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => (name === 'x-new-access-token' ? 'refreshed-token' : null),
        },
        json: async () => ({
          ok: true,
          data: mockUser,
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      expect(tokenStore.setAccessToken).toHaveBeenCalledWith('refreshed-token');
    });
  });

  describe('loginLocal() - 이메일/비밀번호 로그인', () => {
    it('로그인에 성공하면 사용자 정보를 설정한다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'tester',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);

      (global.fetch as jest.Mock)
        // bootstrap에서 refresh 실패 (guest 상태)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        // loginLocal: /api/auth/login 성공
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { accessToken: 'login-token' },
          }),
        })
        // loginLocal: /api/users/me 성공
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      await act(async () => {
        await result.current.loginLocal({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.status).toBe('authenticated');
      expect(result.current.user).toEqual(mockUser);
      expect(tokenStore.setAccessToken).toHaveBeenCalledWith('login-token');
    });

    it('로그인 실패 시 에러를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        // loginLocal 실패
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: { message: '잘못된 이메일 또는 비밀번호입니다.' },
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      await expect(
        act(async () => {
          await result.current.loginLocal({
            email: 'wrong@example.com',
            password: 'wrongpass',
          });
        }),
      ).rejects.toThrow('잘못된 이메일 또는 비밀번호입니다.');
    });

    it('accessToken이 응답에 없으면 에러를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        // loginLocal 성공하지만 토큰 없음
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {},
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      await expect(
        act(async () => {
          await result.current.loginLocal({
            email: 'test@example.com',
            password: 'password123',
          });
        }),
      ).rejects.toThrow('accessToken이 응답에 없습니다.');
    });
  });

  describe('loginAsGuest() - 게스트 모드 전환', () => {
    it('게스트 상태로 전환한다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => null,
        },
        json: async () => ({
          ok: true,
          data: mockUser,
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      act(() => {
        result.current.loginAsGuest();
      });

      expect(result.current.status).toBe('guest');
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(tokenStore.clearAccessToken).toHaveBeenCalled();
    });
  });

  describe('logout() - 로그아웃', () => {
    it('로그아웃 API를 호출하고 guest 상태가 된다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        })
        // logout
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.status).toBe('guest');
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(tokenStore.clearAccessToken).toHaveBeenCalled();

      const logoutCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/api/auth/logout'),
      );
      expect(logoutCall).toBeDefined();
    });

    it('로그아웃 API 실패 시에도 로컬 상태는 정리된다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        })
        // logout 실패
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.status).toBe('guest');
      expect(result.current.user).toBeNull();
    });
  });

  describe('logoutAll() - 모든 기기에서 로그아웃', () => {
    it('logoutAll API를 호출하고 guest 상태가 된다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        })
        // logoutAll
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      await act(async () => {
        await result.current.logoutAll();
      });

      expect(result.current.status).toBe('guest');

      const logoutAllCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/api/auth/logout-all'),
      );
      expect(logoutAllCall).toBeDefined();
    });
  });

  describe('refreshUser() - 사용자 정보 갱신', () => {
    it('토큰이 있으면 사용자 정보를 다시 가져온다', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const updatedUser = {
        ...mockUser,
        creditBalance: 200,
      };

      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('valid-token');

      (global.fetch as jest.Mock)
        // bootstrap
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        })
        // refreshUser
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: updatedUser,
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('authenticated');
      });

      expect(result.current.user?.creditBalance).toBe(100);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.creditBalance).toBe(200);
    });

    it('토큰이 없으면 아무것도 하지 않는다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      const fetchCallsBefore = (global.fetch as jest.Mock).mock.calls.length;

      await act(async () => {
        await result.current.refreshUser();
      });

      const fetchCallsAfter = (global.fetch as jest.Mock).mock.calls.length;

      expect(fetchCallsAfter).toBe(fetchCallsBefore);
    });
  });

  describe('통합 시나리오', () => {
    it('guest → 로그인 → refreshUser → 로그아웃 전체 플로우', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'tester',
        creditBalance: 100,
        tier: 'free' as const,
        authProvider: 'local',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const updatedUser = {
        ...mockUser,
        creditBalance: 150,
      };

      // 처음에는 토큰 없음
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);

      (global.fetch as jest.Mock)
        // 1. bootstrap (guest)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        // 2. login
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { accessToken: 'new-token' },
          }),
        })
        // 3. fetchMe after login
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: mockUser,
          }),
        })
        // 4. refreshUser
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
          json: async () => ({
            ok: true,
            data: updatedUser,
          }),
        })
        // 5. logout
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // guest 확인
      await waitFor(() => {
        expect(result.current.status).toBe('guest');
      });

      // 로그인 후에는 토큰이 있어야 함
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('new-token');

      // 로그인
      await act(async () => {
        await result.current.loginLocal({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.status).toBe('authenticated');
      expect(result.current.user?.creditBalance).toBe(100);

      // refreshUser
      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.creditBalance).toBe(150);

      // 로그아웃
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.status).toBe('guest');
      expect(result.current.user).toBeNull();
    });
  });
});
