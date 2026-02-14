import { GuestArchivesRepository } from './guest-archives.repository';
import { indexedDB, type GuestArchive } from '../storage/indexeddb';

// IndexedDB 모킹
jest.mock('../storage/indexeddb', () => ({
  indexedDB: {
    getAll: jest.fn(),
    getById: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

describe('guest-archives.repository', () => {
  let repository: GuestArchivesRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GuestArchivesRepository();
  });

  describe('list() - 아카이브 목록 조회', () => {
    const mockArchives: GuestArchive[] = [
      {
        id: '1',
        title: '제목1',
        content: '내용1',
        tone: 'formal',
        purpose: 'request',
        relationship: 'professor',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '제목2',
        content: '내용2',
        tone: 'casual',
        purpose: 'thank',
        relationship: 'friend',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1시간 전
      },
    ];

    it('빈 쿼리로 목록을 조회할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list();

      expect(result.ok).toBe(true);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(indexedDB.getAll).toHaveBeenCalledWith('archives');
    });

    it('tone으로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list({ tone: 'formal' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].tone).toBe('formal');
    });

    it('relationship으로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list({ relationship: 'professor' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].relationship).toBe('professor');
    });

    it('purpose로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list({ purpose: 'request' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].purpose).toBe('request');
    });

    it('여러 필터를 조합할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list({
        tone: 'formal',
        relationship: 'professor',
        purpose: 'request',
      });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].id).toBe('1');
    });

    it('7일 이전 데이터는 자동으로 필터링된다', async () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const archivesWithOld: GuestArchive[] = [
        ...mockArchives,
        {
          id: '3',
          title: '오래된 데이터',
          content: '8일 전 데이터',
          tone: 'neutral',
          createdAt: eightDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(archivesWithOld);

      const result = await repository.list();

      expect(result.data.total).toBe(2); // 8일 전 데이터는 제외
      expect(result.data.items.every((item) => item.id !== '3')).toBe(true);
    });

    it('최신순으로 정렬된다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list();

      expect(result.data.items[0].id).toBe('1'); // 최신 항목
      expect(result.data.items[1].id).toBe('2'); // 1시간 전 항목
    });

    it('페이지네이션을 지원한다', async () => {
      const manyArchives: GuestArchive[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        title: `제목${i + 1}`,
        content: `내용${i + 1}`,
        tone: 'neutral',
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        purpose: '',
        relationship: '',
      }));

      (indexedDB.getAll as jest.Mock).mockResolvedValue(manyArchives);

      const result = await repository.list({ page: 2, limit: 10 });

      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.items).toHaveLength(10);
      expect(result.data.total).toBe(50);
    });

    it('기본 페이지는 1이고 기본 limit은 20이다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list();

      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it('preview는 content의 처음 100자로 생성된다', async () => {
      const longContent = 'A'.repeat(200);
      const archiveWithLongContent: GuestArchive[] = [
        {
          id: '1',
          title: '제목',
          content: longContent,
          tone: 'neutral',
          createdAt: new Date().toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(archiveWithLongContent);

      const result = await repository.list();

      expect(result.data.items[0].preview).toBe('A'.repeat(100));
    });
  });

  describe('get() - 아카이브 상세 조회', () => {
    const mockArchive: GuestArchive = {
      id: '1',
      title: '테스트 제목',
      content: '테스트 내용입니다.',
      tone: 'formal',
      purpose: 'request',
      relationship: 'professor',
      rationale: '작성 근거',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    it('특정 아카이브를 조회할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockArchive);

      const result = await repository.get('1');

      expect(result.ok).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.content).toBe('테스트 내용입니다.');
      expect(indexedDB.getById).toHaveBeenCalledWith('archives', '1');
    });

    it('rationale 필드를 포함한다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockArchive);

      const result = await repository.get('1');

      expect(result.data.rationale).toBe('작성 근거');
    });

    it('존재하지 않는 아카이브 조회 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.get('non-existent')).rejects.toThrow('아카이브를 찾을 수 없습니다.');
    });

    it('preview는 content의 처음 100자로 생성된다', async () => {
      const longArchive = {
        ...mockArchive,
        content: 'B'.repeat(200),
      };
      (indexedDB.getById as jest.Mock).mockResolvedValue(longArchive);

      const result = await repository.get('1');

      expect(result.data.preview).toBe('B'.repeat(100));
    });
  });

  describe('create() - 아카이브 생성', () => {
    it('새 아카이브를 생성할 수 있다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createData = {
        title: '새 아카이브',
        content: '새 내용',
        tone: 'formal',
        purpose: 'request',
        relationship: 'professor',
      };

      const result = await repository.create(createData);

      expect(result.ok).toBe(true);
      expect(result.data.id).toMatch(/^guest-archive-/);
      expect(indexedDB.add).toHaveBeenCalledWith(
        'archives',
        expect.objectContaining({
          title: '새 아카이브',
          content: '새 내용',
          tone: 'formal',
        }),
      );
    });

    it('고유한 ID를 생성한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result1 = await repository.create({ content: '내용1' });
      const result2 = await repository.create({ content: '내용2' });

      expect(result1.data.id).not.toBe(result2.data.id);
    });

    it('생성 시각(createdAt)을 자동으로 설정한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({ content: '내용' });

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('필수 필드가 없으면 기본값을 사용한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({});

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.title).toBe('');
      expect(addCall.content).toBe('');
      expect(addCall.tone).toBe('neutral');
    });

    it('rationale을 포함하여 생성할 수 있다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({
        content: '내용',
        rationale: '생성 근거',
      });

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.rationale).toBe('생성 근거');
    });
  });

  describe('remove() - 아카이브 삭제', () => {
    it('아카이브를 삭제할 수 있다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove('1');

      expect(indexedDB.delete).toHaveBeenCalledWith('archives', '1');
    });

    it('삭제 시 void를 반환한다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.remove('1');

      expect(result).toBeUndefined();
    });
  });

  describe('count() - 아카이브 개수 조회', () => {
    it('아카이브 개수를 조회할 수 있다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(10);

      const result = await repository.count();

      expect(result).toBe(10);
      expect(indexedDB.count).toHaveBeenCalledWith('archives');
    });

    it('아카이브가 없으면 0을 반환한다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('cleanupOld() - 오래된 데이터 정리', () => {
    it('7일 이전 데이터를 삭제한다', async () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      const mockArchives: GuestArchive[] = [
        {
          id: 'recent',
          title: '최근',
          content: '5일 전',
          tone: 'neutral',
          createdAt: fiveDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
        {
          id: 'old1',
          title: '오래됨1',
          content: '8일 전',
          tone: 'neutral',
          createdAt: eightDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
        {
          id: 'old2',
          title: '오래됨2',
          content: '10일 전',
          tone: 'neutral',
          createdAt: tenDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.cleanupOld();

      expect(indexedDB.delete).toHaveBeenCalledTimes(2);
      expect(indexedDB.delete).toHaveBeenCalledWith('archives', 'old1');
      expect(indexedDB.delete).toHaveBeenCalledWith('archives', 'old2');
    });

    it('모든 데이터가 7일 이내면 삭제하지 않는다', async () => {
      const recentArchives: GuestArchive[] = [
        {
          id: '1',
          title: '최근1',
          content: '1일 전',
          tone: 'neutral',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: '',
          relationship: '',
        },
        {
          id: '2',
          title: '최근2',
          content: '3일 전',
          tone: 'neutral',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(recentArchives);
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.cleanupOld();

      expect(indexedDB.delete).not.toHaveBeenCalled();
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('생성 → 조회 → 삭제 플로우가 동작한다', async () => {
      // 1. 생성
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createResult = await repository.create({
        title: '새 아카이브',
        content: '새 내용입니다.',
        tone: 'formal',
      });

      expect(createResult.ok).toBe(true);

      // 2. 조회
      const mockCreated: GuestArchive = {
        id: createResult.data.id,
        title: '새 아카이브',
        content: '새 내용입니다.',
        tone: 'formal',
        createdAt: new Date().toISOString(),
        purpose: '',
        relationship: '',
      };

      (indexedDB.getById as jest.Mock).mockResolvedValue(mockCreated);

      const getResult = await repository.get(createResult.data.id);

      expect(getResult.data.content).toBe('새 내용입니다.');
      expect(getResult.data.tone).toBe('formal');

      // 3. 삭제
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove(createResult.data.id);

      expect(indexedDB.delete).toHaveBeenCalledWith('archives', createResult.data.id);
    });
  });

  describe('게스트 모드 제약사항', () => {
    it('7일 제한이 list()에 자동으로 적용된다', async () => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const mockArchives: GuestArchive[] = [
        {
          id: '1',
          title: '6일 전',
          content: '내용',
          tone: 'neutral',
          createdAt: sixDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
        {
          id: '2',
          title: '8일 전',
          content: '내용',
          tone: 'neutral',
          createdAt: eightDaysAgo.toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockArchives);

      const result = await repository.list();

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].id).toBe('1');
    });
  });
});
