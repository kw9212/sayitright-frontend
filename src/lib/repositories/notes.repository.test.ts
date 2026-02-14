import { notesRepository } from './notes.repository';

// fetch 모킹
global.fetch = jest.fn();

// sessionStorage 모킹은 jest.setup.ts에서 자동 처리됨

describe('notes.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    sessionStorage.clear();
  });

  describe('list() - 노트 목록 조회', () => {
    const mockResponse = {
      data: {
        notes: [
          {
            id: '1',
            term: '테스트 용어',
            description: '설명',
            example: '예시',
            isStarred: false,
            createdAt: '2024-01-01',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    };

    it('빈 쿼리로 목록을 조회할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await notesRepository.list({});

      expect(result.notes).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/notes?',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('검색어(q)를 쿼리에 포함할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await notesRepository.list({ q: '검색어' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('q=%EA%B2%80%EC%83%89%EC%96%B4');
    });

    it('정렬(sort) 옵션을 쿼리에 포함할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await notesRepository.list({ sort: 'latest' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=latest');
    });

    it('페이지네이션을 쿼리에 포함할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await notesRepository.list({ page: 2, limit: 20 });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('page=2');
      expect(url).toContain('limit=20');
    });

    it('여러 쿼리 옵션을 조합할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await notesRepository.list({
        q: '용어',
        sort: 'term_asc',
        page: 1,
        limit: 10,
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=term_asc');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('토큰이 없어도 요청을 보낼 수 있다', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await notesRepository.list({});

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('get() - 노트 상세 조회', () => {
    const mockNote = {
      data: {
        id: '1',
        term: '테스트 용어',
        description: '상세 설명',
        example: '예시 문장',
        isStarred: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };

    it('특정 노트를 조회할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockNote,
      });

      const result = await notesRepository.get('1');

      expect(result.term).toBe('테스트 용어');
      expect(result.isStarred).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/proxy/v1/notes/1', expect.any(Object));
    });
  });

  describe('create() - 노트 생성', () => {
    const mockCreateResponse = {
      data: {
        id: 'new-note',
        term: '새 용어',
        description: '설명',
        example: null,
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };

    it('새 노트를 생성할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const createData = {
        term: '새 용어',
        description: '설명',
        example: '예시',
      };

      const result = await notesRepository.create(createData);

      expect(result.id).toBe('new-note');
      expect(result.term).toBe('새 용어');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/notes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        }),
      );
    });

    it('필수 필드(term)만으로 생성할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const minimalData = {
        term: '용어만',
      };

      await notesRepository.create(minimalData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body)).toEqual(minimalData);
    });

    it('description과 example을 선택적으로 포함할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreateResponse,
      });

      const fullData = {
        term: '용어',
        description: '설명 포함',
        example: '예시 포함',
      };

      await notesRepository.create(fullData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      const parsedBody = JSON.parse(body);
      expect(parsedBody.description).toBe('설명 포함');
      expect(parsedBody.example).toBe('예시 포함');
    });
  });

  describe('update() - 노트 수정', () => {
    const mockUpdateResponse = {
      data: {
        id: '1',
        term: '수정된 용어',
        description: '수정된 설명',
        example: '수정된 예시',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    };

    it('노트를 수정할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      const updateData = {
        term: '수정된 용어',
        description: '수정된 설명',
      };

      const result = await notesRepository.update('1', updateData);

      expect(result.term).toBe('수정된 용어');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/notes/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        }),
      );
    });

    it('일부 필드만 수정할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      const updateData = {
        term: '용어만 수정',
      };

      await notesRepository.update('1', updateData);

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body)).toEqual(updateData);
    });

    it('description만 수정할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      await notesRepository.update('1', {
        description: '새 설명',
      });

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).description).toBe('새 설명');
    });

    it('example만 수정할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      await notesRepository.update('1', {
        example: '새 예시',
      });

      const body = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(JSON.parse(body).example).toBe('새 예시');
    });
  });

  describe('remove() - 노트 삭제', () => {
    it('노트를 삭제할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await notesRepository.remove('1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/notes/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });

    it('삭제 시 void를 반환한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await notesRepository.remove('1');

      expect(result).toBeUndefined();
    });
  });

  describe('toggleStar() - 즐겨찾기 토글', () => {
    const mockStarResponse = {
      data: {
        id: '1',
        term: '용어',
        description: '설명',
        example: null,
        isStarred: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };

    it('노트를 즐겨찾기에 추가할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStarResponse,
      });

      const result = await notesRepository.toggleStar('1');

      expect(result.isStarred).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/v1/notes/1/star',
        expect.objectContaining({
          method: 'PATCH',
        }),
      );
    });

    it('PATCH 메서드를 사용한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStarResponse,
      });

      await notesRepository.toggleStar('1');

      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(options.method).toBe('PATCH');
    });

    it('즐겨찾기를 해제할 수 있다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      const unstarResponse = {
        data: {
          ...mockStarResponse.data,
          isStarred: false,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => unstarResponse,
      });

      const result = await notesRepository.toggleStar('1');

      expect(result.isStarred).toBe(false);
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 에러 메시지를 던진다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: '잘못된 요청입니다.' },
        }),
      });

      await expect(notesRepository.list({})).rejects.toThrow('잘못된 요청입니다.');
    });

    it('서버 에러 메시지가 없으면 기본 메시지를 사용한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(notesRepository.list({})).rejects.toThrow('요청 처리 중 오류가 발생했습니다.');
    });

    it('404 에러를 처리한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          message: '노트를 찾을 수 없습니다.',
        }),
      });

      await expect(notesRepository.get('non-existent')).rejects.toThrow('노트를 찾을 수 없습니다.');
    });

    it('생성 실패 시 에러를 던진다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'term은 필수입니다.' },
        }),
      });

      await expect(
        notesRepository.create({
          term: '',
        }),
      ).rejects.toThrow('term은 필수입니다.');
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('노트 생성 → 조회 → 수정 → 즐겨찾기 → 삭제 플로우가 동작한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');

      // 1. 생성
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'new-note',
            term: '새 용어',
            description: '설명',
            example: null,
            isStarred: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        }),
      });

      const created = await notesRepository.create({
        term: '새 용어',
        description: '설명',
      });
      expect(created.id).toBe('new-note');

      // 2. 조회
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: created,
        }),
      });

      const fetched = await notesRepository.get('new-note');
      expect(fetched.term).toBe('새 용어');

      // 3. 수정
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            ...created,
            term: '수정된 용어',
            example: '예시 추가',
          },
        }),
      });

      const updated = await notesRepository.update('new-note', {
        term: '수정된 용어',
        example: '예시 추가',
      });
      expect(updated.term).toBe('수정된 용어');

      // 4. 즐겨찾기
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            ...updated,
            isStarred: true,
          },
        }),
      });

      const starred = await notesRepository.toggleStar('new-note');
      expect(starred.isStarred).toBe(true);

      // 5. 삭제
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await notesRepository.remove('new-note');
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/proxy/v1/notes/new-note',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('정렬 옵션', () => {
    it('latest 정렬을 지원한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({ sort: 'latest' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=latest');
    });

    it('oldest 정렬을 지원한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({ sort: 'oldest' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=oldest');
    });

    it('term_asc 정렬을 지원한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({ sort: 'term_asc' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=term_asc');
    });

    it('term_desc 정렬을 지원한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({ sort: 'term_desc' });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('sort=term_desc');
    });
  });

  describe('HTTP 헤더', () => {
    it('Content-Type 헤더를 포함한다', async () => {
      sessionStorage.setItem('access_token', 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({});

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('토큰이 있으면 Authorization 헤더를 포함한다', async () => {
      sessionStorage.setItem('access_token', 'my-secret-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { notes: [], pagination: {} } }),
      });

      await notesRepository.list({});

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer my-secret-token');
    });
  });
});
