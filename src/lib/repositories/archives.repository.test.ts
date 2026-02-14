import { archivesRepository } from './archives.repository';
import { tokenStore } from '../auth/token';

// tokenStore 모킹
jest.mock('../auth/token', () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
    clearAccessToken: jest.fn(),
  },
}));

// fetch 모킹
global.fetch = jest.fn();

describe('archives.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('list() - 아카이브 목록 조회', () => {
    const mockResponse = {
      ok: true,
      data: {
        items: [
          {
            id: '1',
            title: '테스트 아카이브',
            preview: '미리보기',
            tone: 'formal',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    };

    it('쿼리 없이 목록을 조회할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await archivesRepository.list();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('페이지 번호와 limit을 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({ page: 2, limit: 20 });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?page=2&limit=20',
        expect.any(Object),
      );
    });

    it('검색어(q)를 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({ q: '검색어' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?q=%EA%B2%80%EC%83%89%EC%96%B4',
        expect.any(Object),
      );
    });

    it('tone 필터를 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({ tone: 'formal' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?tone=formal',
        expect.any(Object),
      );
    });

    it('relationship 필터를 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({ relationship: 'professor' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?relationship=professor',
        expect.any(Object),
      );
    });

    it('purpose 필터를 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({ purpose: 'request' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?purpose=request',
        expect.any(Object),
      );
    });

    it('날짜 범위(from, to)를 쿼리에 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({
        from: '2024-01-01',
        to: '2024-12-31',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives?from=2024-01-01&to=2024-12-31',
        expect.any(Object),
      );
    });

    it('여러 필터를 동시에 사용할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list({
        page: 1,
        limit: 10,
        q: '이메일',
        tone: 'formal',
        relationship: 'professor',
        purpose: 'request',
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('tone=formal');
      expect(url).toContain('relationship=professor');
      expect(url).toContain('purpose=request');
    });

    it('토큰이 없어도 요청을 보낼 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await archivesRepository.list();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('get() - 아카이브 상세 조회', () => {
    const mockDetailResponse = {
      ok: true,
      data: {
        id: '1',
        title: '테스트 아카이브',
        preview: '미리보기',
        content: '전체 내용입니다.',
        tone: 'formal',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };

    it('특정 아카이브를 조회할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDetailResponse,
      });

      const result = await archivesRepository.get('1');

      expect(result).toEqual(mockDetailResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('ID를 URL에 정확히 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDetailResponse,
      });

      await archivesRepository.get('archive-123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives/archive-123',
        expect.any(Object),
      );
    });
  });

  describe('remove() - 아카이브 삭제', () => {
    it('아카이브를 삭제할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const result = await archivesRepository.remove('1');

      expect(result).toEqual({ ok: true });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/archives/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('DELETE 메서드를 사용한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await archivesRepository.remove('1');

      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(options.method).toBe('DELETE');
    });
  });

  describe('에러 처리', () => {
    it('401 에러 시 "로그인이 필요합니다" 메시지를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        });

      await expect(archivesRepository.list()).rejects.toThrow('로그인이 필요합니다.');
    });

    it('403 에러 시 "접근 권한이 없습니다" 메시지를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      await expect(archivesRepository.list()).rejects.toThrow('접근 권한이 없습니다.');
    });

    it('404 에러 시 "요청한 리소스를 찾을 수 없습니다" 메시지를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(archivesRepository.get('non-existent')).rejects.toThrow(
        '요청한 리소스를 찾을 수 없습니다.',
      );
    });

    it('500 에러 시 "서버 오류가 발생했습니다" 메시지를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(archivesRepository.list()).rejects.toThrow(
        '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    });

    it('서버에서 제공한 에러 메시지를 사용한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: '잘못된 요청입니다.' },
        }),
      });

      await expect(archivesRepository.list()).rejects.toThrow('잘못된 요청입니다.');
    });

    it('서버 에러 메시지가 배열이면 join한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: ['에러1', '에러2', '에러3'] },
        }),
      });

      await expect(archivesRepository.list()).rejects.toThrow('에러1, 에러2, 에러3');
    });
  });

  describe('토큰 갱신 로직', () => {
    it('401 에러 발생 시 토큰을 갱신하고 재시도한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');

      // 첫 번째 요청: 401 에러
      // 토큰 갱신 요청: 성공
      // 재시도 요청: 성공
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { accessToken: 'new-token' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { items: [], total: 0 } }),
        });

      const result = await archivesRepository.list();

      expect(result.ok).toBe(true);
      expect(tokenStore.setAccessToken).toHaveBeenCalledWith('new-token');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('토큰 갱신 실패 시 에러를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');

      // 첫 번째 요청: 401 에러
      // 토큰 갱신 요청: 실패
      // 재시도 요청: 401 에러
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        });

      await expect(archivesRepository.list()).rejects.toThrow('로그인이 필요합니다.');
    });

    it('토큰 갱신은 최대 1번만 시도한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');

      // 모든 요청이 401 에러
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(archivesRepository.list()).rejects.toThrow();

      // 원래 요청(1) + 갱신 요청(1) = 2번
      // 갱신이 실패하면 재시도하지 않음
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('HTTP 헤더', () => {
    it('Content-Type: application/json 헤더를 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: { items: [], total: 0 } }),
      });

      await archivesRepository.list();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('credentials: include 옵션을 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: { items: [], total: 0 } }),
      });

      await archivesRepository.list();

      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(options.credentials).toBe('include');
    });

    it('토큰이 있으면 Authorization 헤더를 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('my-token-123');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: { items: [], total: 0 } }),
      });

      await archivesRepository.list();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer my-token-123');
    });
  });
});
