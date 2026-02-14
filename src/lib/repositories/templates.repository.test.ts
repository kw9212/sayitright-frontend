import { templatesRepository } from './templates.repository';
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

describe('templates.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('list() - 템플릿 목록 조회', () => {
    const mockResponse = {
      ok: true,
      data: {
        items: [
          {
            id: '1',
            title: '테스트 템플릿',
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

      const result = await templatesRepository.list();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/templates?',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('모든 쿼리 파라미터를 포함할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await templatesRepository.list({
        page: 2,
        limit: 20,
        q: '검색',
        tone: 'formal',
        relationship: 'professor',
        purpose: 'request',
        from: '2024-01-01',
        to: '2024-12-31',
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('page=2');
      expect(url).toContain('limit=20');
      expect(url).toContain('tone=formal');
      expect(url).toContain('relationship=professor');
      expect(url).toContain('purpose=request');
      expect(url).toContain('from=2024-01-01');
      expect(url).toContain('to=2024-12-31');
    });
  });

  describe('get() - 템플릿 상세 조회', () => {
    const mockDetailResponse = {
      ok: true,
      data: {
        id: '1',
        title: '테스트 템플릿',
        preview: '미리보기',
        content: '전체 내용입니다.',
        tone: 'formal',
        rationale: '작성 근거',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };

    it('특정 템플릿을 조회할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDetailResponse,
      });

      const result = await templatesRepository.get('1');

      expect(result).toEqual(mockDetailResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/templates/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('rationale 필드를 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDetailResponse,
      });

      const result = await templatesRepository.get('1');

      expect(result.data.rationale).toBe('작성 근거');
    });
  });

  describe('create() - 템플릿 생성', () => {
    const mockCreateResponse = {
      ok: true,
      data: {
        id: 'new-template-id',
      },
    };

    it('새 템플릿을 생성할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const createData = {
        title: '새 템플릿',
        content: '템플릿 내용',
        tone: 'formal',
        relationship: 'professor',
        purpose: 'request',
      };

      const result = await templatesRepository.create(createData);

      expect(result).toEqual(mockCreateResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/templates',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        }),
      );
    });

    it('POST 메서드를 사용한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      await templatesRepository.create({
        content: '내용',
        tone: 'formal',
      });

      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(options.method).toBe('POST');
    });

    it('필수 필드만으로 생성할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const minimalData = {
        content: '최소 내용',
        tone: 'casual',
      };

      await templatesRepository.create(minimalData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body)).toEqual(minimalData);
    });

    it('아카이브에서 변환하여 생성할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const createData = {
        sourceArchiveId: 'archive-123',
        content: '아카이브 내용',
        tone: 'formal',
      };

      await templatesRepository.create(createData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).sourceArchiveId).toBe('archive-123');
    });

    it('rationale을 포함하여 생성할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const createData = {
        content: '내용',
        tone: 'formal',
        rationale: '이 템플릿이 필요한 이유',
      };

      await templatesRepository.create(createData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).rationale).toBe('이 템플릿이 필요한 이유');
    });
  });

  describe('update() - 템플릿 수정', () => {
    const mockUpdateResponse = {
      ok: true,
      data: {
        id: '1',
        title: '수정된 템플릿',
        preview: '수정된 미리보기',
        content: '수정된 내용',
        tone: 'polite',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    };

    it('템플릿을 수정할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      const updateData = {
        title: '수정된 템플릿',
        content: '수정된 내용',
      };

      const result = await templatesRepository.update('1', updateData);

      expect(result).toEqual(mockUpdateResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/templates/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        }),
      );
    });

    it('PUT 메서드를 사용한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      await templatesRepository.update('1', { title: '새 제목' });

      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(options.method).toBe('PUT');
    });

    it('일부 필드만 수정할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      const updateData = {
        title: '제목만 수정',
      };

      await templatesRepository.update('1', updateData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body)).toEqual(updateData);
    });

    it('tone을 변경할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      await templatesRepository.update('1', { tone: 'casual' });

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).tone).toBe('casual');
    });

    it('relationship을 변경할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      await templatesRepository.update('1', { relationship: 'colleague' });

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).relationship).toBe('colleague');
    });

    it('여러 필드를 동시에 수정할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      const updateData = {
        title: '새 제목',
        content: '새 내용',
        tone: 'friendly',
        relationship: 'friend',
        purpose: 'thank',
        rationale: '새 근거',
      };

      await templatesRepository.update('1', updateData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body)).toEqual(updateData);
    });
  });

  describe('remove() - 템플릿 삭제', () => {
    it('템플릿을 삭제할 수 있다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const result = await templatesRepository.remove('1');

      expect(result).toEqual({ ok: true });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/templates/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
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

      await expect(templatesRepository.list()).rejects.toThrow('로그인이 필요합니다.');
    });

    it('404 에러 시 "요청한 리소스를 찾을 수 없습니다" 메시지를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(templatesRepository.get('non-existent')).rejects.toThrow(
        '요청한 리소스를 찾을 수 없습니다.',
      );
    });

    it('생성 실패 시 에러를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: '필수 필드가 누락되었습니다.' },
        }),
      });

      await expect(
        templatesRepository.create({
          content: '내용',
          tone: 'formal',
        }),
      ).rejects.toThrow('필수 필드가 누락되었습니다.');
    });

    it('수정 실패 시 에러를 던진다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      await expect(templatesRepository.update('1', { title: '새 제목' })).rejects.toThrow(
        '접근 권한이 없습니다.',
      );
    });
  });

  describe('토큰 갱신 로직', () => {
    it('401 에러 발생 시 토큰을 갱신하고 재시도한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('expired-token');

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

      const result = await templatesRepository.list();

      expect(result.ok).toBe(true);
      expect(tokenStore.setAccessToken).toHaveBeenCalledWith('new-token');
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('템플릿 생성 → 조회 → 수정 → 삭제 플로우가 동작한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');

      // 1. 생성
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: { id: 'new-id' } }),
      });

      const createResult = await templatesRepository.create({
        title: '새 템플릿',
        content: '내용',
        tone: 'formal',
      });

      expect(createResult.data.id).toBe('new-id');

      // 2. 조회
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: 'new-id',
            title: '새 템플릿',
            content: '내용',
            preview: '내용',
            tone: 'formal',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        }),
      });

      const getResult = await templatesRepository.get('new-id');
      expect(getResult.data.title).toBe('새 템플릿');

      // 3. 수정
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: 'new-id',
            title: '수정된 템플릿',
            content: '수정된 내용',
            preview: '수정된 내용',
            tone: 'casual',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
        }),
      });

      const updateResult = await templatesRepository.update('new-id', {
        title: '수정된 템플릿',
        tone: 'casual',
      });

      expect(updateResult.data.title).toBe('수정된 템플릿');

      // 4. 삭제
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const removeResult = await templatesRepository.remove('new-id');
      expect(removeResult.ok).toBe(true);
    });

    it('아카이브를 템플릿으로 변환하는 플로우가 동작한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: { id: 'converted-template' } }),
      });

      // 아카이브 ID를 포함하여 템플릿 생성
      const result = await templatesRepository.create({
        sourceArchiveId: 'archive-123',
        title: '변환된 템플릿',
        content: '아카이브 내용',
        tone: 'formal',
        rationale: '자주 사용하는 형식이라 템플릿으로 저장',
      });

      expect(result.data.id).toBe('converted-template');

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      const parsedBody = JSON.parse(body);
      expect(parsedBody.sourceArchiveId).toBe('archive-123');
      expect(parsedBody.rationale).toBe('자주 사용하는 형식이라 템플릿으로 저장');
    });
  });

  describe('HTTP 헤더', () => {
    it('create 시 Content-Type 헤더를 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: { id: '1' } }),
      });

      await templatesRepository.create({
        content: '내용',
        tone: 'formal',
      });

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('update 시 Authorization 헤더를 포함한다', async () => {
      (tokenStore.getAccessToken as jest.Mock).mockReturnValue('my-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: {} }),
      });

      await templatesRepository.update('1', { title: '새 제목' });

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer my-token');
    });
  });
});
