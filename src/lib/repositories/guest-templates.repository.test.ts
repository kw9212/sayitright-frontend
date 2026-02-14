import { GuestTemplatesRepository } from './guest-templates.repository';
import { indexedDB, type GuestTemplate } from '../storage/indexeddb';

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

describe('guest-templates.repository', () => {
  let repository: GuestTemplatesRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GuestTemplatesRepository();
  });

  describe('list() - 템플릿 목록 조회', () => {
    const mockTemplates: GuestTemplate[] = [
      {
        id: '1',
        title: '템플릿1',
        content: '내용1',
        tone: 'formal',
        purpose: 'request',
        relationship: 'professor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '템플릿2',
        content: '내용2',
        tone: 'casual',
        purpose: 'thank',
        relationship: 'friend',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ];

    it('빈 쿼리로 목록을 조회할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list();

      expect(result.ok).toBe(true);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(indexedDB.getAll).toHaveBeenCalledWith('templates');
    });

    it('tone으로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list({ tone: 'formal' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].tone).toBe('formal');
    });

    it('relationship으로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list({ relationship: 'professor' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].relationship).toBe('professor');
    });

    it('purpose로 필터링할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list({ purpose: 'request' });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].purpose).toBe('request');
    });

    it('여러 필터를 조합할 수 있다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list({
        tone: 'formal',
        relationship: 'professor',
        purpose: 'request',
      });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].id).toBe('1');
    });

    it('최신순으로 정렬된다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list();

      expect(result.data.items[0].id).toBe('1'); // 최신 항목
      expect(result.data.items[1].id).toBe('2'); // 1시간 전 항목
    });

    it('페이지네이션을 지원한다', async () => {
      const manyTemplates: GuestTemplate[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        title: `템플릿${i + 1}`,
        content: `내용${i + 1}`,
        tone: 'neutral',
        purpose: '',
        relationship: '',
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
      }));

      (indexedDB.getAll as jest.Mock).mockResolvedValue(manyTemplates);

      const result = await repository.list({ page: 2, limit: 10 });

      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.items).toHaveLength(10);
      expect(result.data.total).toBe(50);
    });

    it('기본 페이지는 1이고 기본 limit은 20이다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list();

      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it('preview는 content의 처음 100자로 생성된다', async () => {
      const longContent = 'A'.repeat(200);
      const templateWithLongContent: GuestTemplate[] = [
        {
          id: '1',
          title: '제목',
          content: longContent,
          tone: 'neutral',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          purpose: '',
          relationship: '',
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(templateWithLongContent);

      const result = await repository.list();

      expect(result.data.items[0].preview).toBe('A'.repeat(100));
    });

    it('title 필드를 포함한다', async () => {
      (indexedDB.getAll as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await repository.list();

      expect(result.data.items[0].title).toBe('템플릿1');
      expect(result.data.items[1].title).toBe('템플릿2');
    });
  });

  describe('get() - 템플릿 상세 조회', () => {
    const mockTemplate: GuestTemplate = {
      id: '1',
      title: '테스트 템플릿',
      content: '테스트 내용입니다.',
      tone: 'formal',
      purpose: 'request',
      relationship: 'professor',
      rationale: '작성 근거',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('특정 템플릿을 조회할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await repository.get('1');

      expect(result.ok).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.title).toBe('테스트 템플릿');
      expect(result.data.content).toBe('테스트 내용입니다.');
      expect(indexedDB.getById).toHaveBeenCalledWith('templates', '1');
    });

    it('rationale 필드를 포함한다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await repository.get('1');

      expect(result.data.rationale).toBe('작성 근거');
    });

    it('존재하지 않는 템플릿 조회 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.get('non-existent')).rejects.toThrow('템플릿을 찾을 수 없습니다.');
    });

    it('preview는 content의 처음 100자로 생성된다', async () => {
      const longTemplate = {
        ...mockTemplate,
        content: 'B'.repeat(200),
      };
      (indexedDB.getById as jest.Mock).mockResolvedValue(longTemplate);

      const result = await repository.get('1');

      expect(result.data.preview).toBe('B'.repeat(100));
    });
  });

  describe('create() - 템플릿 생성', () => {
    it('새 템플릿을 생성할 수 있다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createData = {
        title: '새 템플릿',
        content: '새 내용',
        tone: 'formal',
        purpose: 'request',
        relationship: 'professor',
      };

      const result = await repository.create(createData);

      expect(result.ok).toBe(true);
      expect(result.data.id).toMatch(/^guest-template-/);
      expect(indexedDB.add).toHaveBeenCalledWith(
        'templates',
        expect.objectContaining({
          title: '새 템플릿',
          content: '새 내용',
          tone: 'formal',
        }),
      );
    });

    it('고유한 ID를 생성한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const result1 = await repository.create({
        content: '내용1',
        tone: 'neutral',
      });
      const result2 = await repository.create({
        content: '내용2',
        tone: 'neutral',
      });

      expect(result1.data.id).not.toBe(result2.data.id);
    });

    it('생성 시각(createdAt, updatedAt)을 자동으로 설정한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({
        content: '내용',
        tone: 'neutral',
      });

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(addCall.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('title이 없으면 빈 문자열을 사용한다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({
        content: '내용',
        tone: 'neutral',
      });

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.title).toBe('');
    });

    it('rationale을 포함하여 생성할 수 있다', async () => {
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      await repository.create({
        content: '내용',
        tone: 'neutral',
        rationale: '생성 근거',
      });

      const addCall = (indexedDB.add as jest.Mock).mock.calls[0][1];
      expect(addCall.rationale).toBe('생성 근거');
    });
  });

  describe('update() - 템플릿 수정', () => {
    const existingTemplate: GuestTemplate = {
      id: '1',
      title: '기존 템플릿',
      content: '기존 내용',
      tone: 'formal',
      purpose: 'request',
      relationship: 'professor',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('템플릿을 수정할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        title: '수정된 템플릿',
        content: '수정된 내용',
      };

      const result = await repository.update('1', updateData);

      expect(result.ok).toBe(true);
      expect(result.data.title).toBe('수정된 템플릿');
      expect(result.data.content).toBe('수정된 내용');
      expect(indexedDB.update).toHaveBeenCalledWith(
        'templates',
        expect.objectContaining({
          id: '1',
          title: '수정된 템플릿',
          content: '수정된 내용',
        }),
      );
    });

    it('일부 필드만 수정할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        title: '제목만 수정',
      };

      const result = await repository.update('1', updateData);

      expect(result.data.title).toBe('제목만 수정');
      expect(result.data.content).toBe('기존 내용'); // 기존 값 유지
    });

    it('tone을 변경할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.update('1', { tone: 'casual' });

      expect(result.data.tone).toBe('casual');
    });

    it('relationship을 변경할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.update('1', { relationship: 'friend' });

      expect(result.data.relationship).toBe('friend');
    });

    it('수정 시 updatedAt을 갱신한다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      await repository.update('1', { title: '새 제목' });

      const updateCall = (indexedDB.update as jest.Mock).mock.calls[0][1];
      expect(updateCall.updatedAt).not.toBe(existingTemplate.updatedAt);
      expect(updateCall.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('존재하지 않는 템플릿 수정 시 에러를 던진다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(null);

      await expect(repository.update('non-existent', { title: '새 제목' })).rejects.toThrow(
        '템플릿을 찾을 수 없습니다.',
      );
    });

    it('여러 필드를 동시에 수정할 수 있다', async () => {
      (indexedDB.getById as jest.Mock).mockResolvedValue(existingTemplate);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        title: '새 제목',
        content: '새 내용',
        tone: 'polite',
        relationship: 'colleague',
        rationale: '새 근거',
      };

      const result = await repository.update('1', updateData);

      expect(result.data.title).toBe('새 제목');
      expect(result.data.content).toBe('새 내용');
      expect(result.data.tone).toBe('polite');
      expect(result.data.relationship).toBe('colleague');
      expect(result.data.rationale).toBe('새 근거');
    });
  });

  describe('remove() - 템플릿 삭제', () => {
    it('템플릿을 삭제할 수 있다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove('1');

      expect(indexedDB.delete).toHaveBeenCalledWith('templates', '1');
    });

    it('삭제 시 void를 반환한다', async () => {
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.remove('1');

      expect(result).toBeUndefined();
    });
  });

  describe('count() - 템플릿 개수 조회', () => {
    it('템플릿 개수를 조회할 수 있다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(10);

      const result = await repository.count();

      expect(result).toBe(10);
      expect(indexedDB.count).toHaveBeenCalledWith('templates');
    });

    it('템플릿이 없으면 0을 반환한다', async () => {
      (indexedDB.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('생성 → 조회 → 수정 → 삭제 플로우가 동작한다', async () => {
      // 1. 생성
      (indexedDB.add as jest.Mock).mockResolvedValue(undefined);

      const createResult = await repository.create({
        title: '새 템플릿',
        content: '새 내용입니다.',
        tone: 'formal',
      });

      expect(createResult.ok).toBe(true);

      // 2. 조회
      const mockCreated: GuestTemplate = {
        id: createResult.data.id,
        title: '새 템플릿',
        content: '새 내용입니다.',
        tone: 'formal',
        purpose: '',
        relationship: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (indexedDB.getById as jest.Mock).mockResolvedValue(mockCreated);

      const getResult = await repository.get(createResult.data.id);

      expect(getResult.data.title).toBe('새 템플릿');
      expect(getResult.data.content).toBe('새 내용입니다.');

      // 3. 수정
      (indexedDB.getById as jest.Mock).mockResolvedValue(mockCreated);
      (indexedDB.update as jest.Mock).mockResolvedValue(undefined);

      const updateResult = await repository.update(createResult.data.id, {
        title: '수정된 템플릿',
        tone: 'casual',
      });

      expect(updateResult.data.title).toBe('수정된 템플릿');
      expect(updateResult.data.tone).toBe('casual');

      // 4. 삭제
      (indexedDB.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.remove(createResult.data.id);

      expect(indexedDB.delete).toHaveBeenCalledWith('templates', createResult.data.id);
    });
  });

  describe('게스트 모드 특징', () => {
    it('7일 제한이 없다 (영구 보관)', async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const oldTemplate: GuestTemplate[] = [
        {
          id: '1',
          title: '1년 전 템플릿',
          content: '내용',
          tone: 'neutral',
          purpose: '',
          relationship: '',
          createdAt: oneYearAgo.toISOString(),
          updatedAt: oneYearAgo.toISOString(),
        },
      ];

      (indexedDB.getAll as jest.Mock).mockResolvedValue(oldTemplate);

      const result = await repository.list();

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].id).toBe('1');
    });
  });
});
