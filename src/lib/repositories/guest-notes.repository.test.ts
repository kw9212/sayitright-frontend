import { GuestNotesRepository } from './guest-notes.repository';
import { indexedDB, type GuestNote } from '../storage/indexeddb';

// IndexedDB 모킹
jest.mock('../storage/indexeddb', () => ({
  indexedDB: {
    getAll: jest.fn(),
    getById: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

describe('guest-notes.repository', () => {
  let repository: GuestNotesRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GuestNotesRepository();
  });

  describe('list() - 노트 목록 조회', () => {
    const mockNotes: GuestNote[] = [
      {
        id: '1',
        term: 'JavaScript',
        description: '프로그래밍 언어',
        example: 'const x = 10;',
        isStarred: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        term: 'React',
        description: 'UI 라이브러리',
        example: '<div>Hello</div>',
        isStarred: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ];

    it('빈 쿼리로 목록을 조회할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list();

      expect(result.notes).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(indexedDB.getAll).toHaveBeenCalledWith('notes');
    });

    it('term으로 검색할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ q: 'javascript' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('JavaScript');
    });

    it('description으로 검색할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ q: '라이브러리' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('React');
    });

    it('example으로 검색할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ q: 'const' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('JavaScript');
    });

    it('검색은 대소문자를 구분하지 않는다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ q: 'REACT' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('React');
    });

    it('latest 정렬을 지원한다 (기본값)', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ sort: 'latest' });

      expect(result.notes[0].id).toBe('1'); // 최신
      expect(result.notes[1].id).toBe('2'); // 1시간 전
    });

    it('oldest 정렬을 지원한다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ sort: 'oldest' });

      expect(result.notes[0].id).toBe('2'); // 1시간 전
      expect(result.notes[1].id).toBe('1'); // 최신
    });

    it('term_asc 정렬을 지원한다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ sort: 'term_asc' });

      expect(result.notes[0].term).toBe('JavaScript');
      expect(result.notes[1].term).toBe('React');
    });

    it('term_desc 정렬을 지원한다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list({ sort: 'term_desc' });

      expect(result.notes[0].term).toBe('React');
      expect(result.notes[1].term).toBe('JavaScript');
    });

    it('페이지네이션을 지원한다', async () => {
      const manyNotes: GuestNote[] = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        term: `용어${i + 1}`,
        description: null,
        example: null,
        isStarred: false,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
      }));

      (indexedDB.getAll as jest.Mock).mockResolvedValue(manyNotes);

      const result = await repository.list({ page: 2, limit: 10 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.notes).toHaveLength(10);
      expect(result.pagination.total).toBe(30);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('기본 페이지는 1이고 기본 limit은 10이다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const result = await repository.list();

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('totalPages를 계산한다', async () => {
      const notes: GuestNote[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        term: `용어${i + 1}`,
        description: null,
        example: null,
        isStarred: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      (indexedDB.getAll as jest.Mock).mockResolvedValue(notes);

      const result = await repository.list({ limit: 10 });

      expect(result.pagination.totalPages).toBe(3);
    });

    it('검색과 정렬을 함께 사용할 수 있다', async () => {
      const notes: GuestNote[] = [
        {
          id: '1',
          term: 'Apple',
          description: '과일',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          term: 'Banana',
          description: '과일',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(notes);

      const result = await repository.list({ q: '과일', sort: 'term_desc' });

      expect(result.notes).toHaveLength(2);
      expect(result.notes[0].term).toBe('Banana');
      expect(result.notes[1].term).toBe('Apple');
    });
  });

  describe('get() - 노트 상세 조회', () => {
    const mockNote: GuestNote = {
      id: '1',
      term: 'TypeScript',
      description: '타입이 있는 JavaScript',
      example: 'const x: number = 10;',
      isStarred: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('특정 노트를 조회할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockNote);

      const result = await repository.get('1');

      expect(result.id).toBe('1');
      expect(result.term).toBe('TypeScript');
      expect(result.isStarred).toBe(true);
      expect(indexedDB.getById).toHaveBeenCalledWith('notes', '1');
    });

    it('존재하지 않는 노트 조회 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.get('non-existent')).rejects.toThrow('노트를 찾을 수 없습니다.');
    });
  });

  describe('create() - 노트 생성', () => {
    it('새 노트를 생성할 수 있다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createData = {
        term: 'Jest',
        description: '테스팅 프레임워크',
        example: 'test("example", () => {})',
      };

      const result = await repository.create(createData);

      expect(result.id).toMatch(/^guest-note-/);
      expect(result.term).toBe('Jest');
      expect(result.isStarred).toBe(false);
      expect(indexedDB.add).toHaveBeenCalledWith(
        'notes',
        expect.objectContaining({
          term: 'Jest',
          description: '테스팅 프레임워크',
        }),
      );
    });

    it('고유한 ID를 생성한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result1 = await repository.create({ term: '용어1' });
      const result2 = await repository.create({ term: '용어2' });

      expect(result1.id).not.toBe(result2.id);
    });

    it('생성 시각(createdAt, updatedAt)을 자동으로 설정한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.create({ term: '용어' });

      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('description과 example이 없으면 null로 설정된다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.create({ term: '용어' });

      expect(result.description).toBeNull();
      expect(result.example).toBeNull();
    });

    it('isStarred는 기본적으로 false이다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.create({ term: '용어' });

      expect(result.isStarred).toBe(false);
    });
  });

  describe('update() - 노트 수정', () => {
    const existingNote: GuestNote = {
      id: '1',
      term: '기존 용어',
      description: '기존 설명',
      example: '기존 예시',
      isStarred: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('노트를 수정할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        term: '수정된 용어',
        description: '수정된 설명',
      };

      const result = await repository.update('1', updateData);

      expect(result.term).toBe('수정된 용어');
      expect(result.description).toBe('수정된 설명');
      expect(indexedDB.update).toHaveBeenCalledWith(
        'notes',
        expect.objectContaining({
          id: '1',
          term: '수정된 용어',
        }),
      );
    });

    it('일부 필드만 수정할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.update('1', { term: '새 용어' });

      expect(result.term).toBe('새 용어');
      expect(result.description).toBe('기존 설명'); // 기존 값 유지
    });

    it('수정 시 updatedAt을 갱신한다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.update('1', { term: '새 용어' });

      expect(result.updatedAt).not.toBe(existingNote.updatedAt);
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('존재하지 않는 노트 수정 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.update('non-existent', { term: '새 용어' })).rejects.toThrow(
        '노트를 찾을 수 없습니다.',
      );
    });
  });

  describe('toggleStar() - 즐겨찾기 토글', () => {
    const existingNote: GuestNote = {
      id: '1',
      term: '용어',
      description: '설명',
      example: null,
      isStarred: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('즐겨찾기를 추가할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.toggleStar('1');

      expect(result.isStarred).toBe(true);
      expect(indexedDB.update).toHaveBeenCalledWith(
        'notes',
        expect.objectContaining({
          id: '1',
          isStarred: true,
        }),
      );
    });

    it('즐겨찾기를 해제할 수 있다', async () => {
      const starredNote = {
        ...existingNote,
        isStarred: true,
      };

      (indexedDB.getById as jest.Mock).mockResolvedValue(starredNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.toggleStar('1');

      expect(result.isStarred).toBe(false);
    });

    it('토글 시 updatedAt을 갱신한다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingNote);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.toggleStar('1');

      expect(result.updatedAt).not.toBe(existingNote.updatedAt);
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('존재하지 않는 노트 토글 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.toggleStar('non-existent')).rejects.toThrow(
        '노트를 찾을 수 없습니다.',
      );
    });
  });

  describe('remove() - 노트 삭제', () => {
    it('노트를 삭제할 수 있다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove('1');

      expect(indexedDB.delete).toHaveBeenCalledWith('notes', '1');
    });

    it('삭제 시 void를 반환한다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.remove('1');

      expect(result).toBeUndefined();
    });
  });

  describe('count() - 노트 개수 조회', () => {
    it('노트 개수를 조회할 수 있다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(15);

      const result = await repository.count();

      expect(result).toBe(15);
      expect(indexedDB.count).toHaveBeenCalledWith('notes');
    });

    it('노트가 없으면 0을 반환한다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('생성 → 조회 → 수정 → 즐겨찾기 → 삭제 플로우가 동작한다', async () => {
      // 1. 생성
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createResult = await repository.create({
        term: 'Node.js',
        description: '서버 사이드 JavaScript',
        example: 'console.log("Hello");',
      });

      expect(createResult.term).toBe('Node.js');
      expect(createResult.isStarred).toBe(false);

      // 2. 조회
      (indexedDB.getById as jest.Mock).mockResolvedValue(createResult);

      const getResult = await repository.get(createResult.id);

      expect(getResult.term).toBe('Node.js');

      // 3. 수정
      (indexedDB.getById as jest.Mock).mockResolvedValue(createResult);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateResult = await repository.update(createResult.id, {
        description: '수정된 설명',
      });

      expect(updateResult.description).toBe('수정된 설명');

      // 4. 즐겨찾기
      (indexedDB.getById as jest.Mock).mockResolvedValue(updateResult);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const starResult = await repository.toggleStar(createResult.id);

      expect(starResult.isStarred).toBe(true);

      // 5. 삭제
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove(createResult.id);

      expect(indexedDB.delete).toHaveBeenCalledWith('notes', createResult.id);
    });
  });

  describe('검색 시나리오', () => {
    it('부분 문자열 검색이 가능하다', async () => {
      const notes: GuestNote[] = [
        {
          id: '1',
          term: 'JavaScript',
          description: 'Programming language',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          term: 'Java',
          description: 'Another language',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(notes);

      const result = await repository.list({ q: 'script' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('JavaScript');
    });

    it('한글 검색이 가능하다', async () => {
      const notes: GuestNote[] = [
        {
          id: '1',
          term: '프론트엔드',
          description: 'UI 개발',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          term: '백엔드',
          description: '서버 개발',
          example: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(notes);

      const result = await repository.list({ q: '서버' });

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].term).toBe('백엔드');
    });
  });
});
