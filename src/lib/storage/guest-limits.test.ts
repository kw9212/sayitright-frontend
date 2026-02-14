import {
  GUEST_LIMITS,
  getGuestUsage,
  setGuestUsage,
  resetDailyEmailCount,
  canCreateTemplate,
  canCreateArchive,
  canCreateNote,
  canGenerateEmail,
  incrementTemplateCount,
  decrementTemplateCount,
  incrementArchiveCount,
  decrementArchiveCount,
  incrementNoteCount,
  decrementNoteCount,
  incrementEmailCount,
  type GuestUsage,
} from './guest-limits';

describe('guest-limits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('GUEST_LIMITS 상수', () => {
    it('템플릿 제한은 1개이다', () => {
      expect(GUEST_LIMITS.TEMPLATES).toBe(1);
    });

    it('아카이브 제한은 10개이다', () => {
      expect(GUEST_LIMITS.ARCHIVES).toBe(10);
    });

    it('노트 제한은 5개이다', () => {
      expect(GUEST_LIMITS.NOTES).toBe(5);
    });

    it('일일 이메일 생성 제한은 3회이다', () => {
      expect(GUEST_LIMITS.DAILY_EMAIL_GENERATION).toBe(3);
    });
  });

  describe('getGuestUsage() - 사용량 조회', () => {
    it('localStorage가 비어있으면 초기값을 반환한다', () => {
      const usage = getGuestUsage();

      expect(usage).toEqual({
        templatesCount: 0,
        archivesCount: 0,
        notesCount: 0,
        dailyEmailCount: 0,
        lastEmailDate: '',
      });
    });

    it('저장된 사용량을 반환한다', () => {
      const mockUsage: GuestUsage = {
        templatesCount: 1,
        archivesCount: 5,
        notesCount: 2,
        dailyEmailCount: 1,
        lastEmailDate: '2024-01-01',
      };

      localStorage.setItem('guest_usage', JSON.stringify(mockUsage));

      const usage = getGuestUsage();

      expect(usage).toEqual(mockUsage);
    });

    it('잘못된 JSON이면 초기값을 반환한다', () => {
      localStorage.setItem('guest_usage', 'invalid-json{');

      const usage = getGuestUsage();

      expect(usage).toEqual({
        templatesCount: 0,
        archivesCount: 0,
        notesCount: 0,
        dailyEmailCount: 0,
        lastEmailDate: '',
      });
    });
  });

  describe('setGuestUsage() - 사용량 저장', () => {
    it('사용량을 localStorage에 저장한다', () => {
      const usage: GuestUsage = {
        templatesCount: 1,
        archivesCount: 5,
        notesCount: 2,
        dailyEmailCount: 1,
        lastEmailDate: '2024-01-01',
      };

      setGuestUsage(usage);

      const stored = localStorage.getItem('guest_usage');
      expect(stored).toBe(JSON.stringify(usage));
    });
  });

  describe('resetDailyEmailCount() - 일일 이메일 카운트 초기화', () => {
    it('날짜가 바뀌면 dailyEmailCount를 0으로 초기화한다', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const usage: GuestUsage = {
        templatesCount: 0,
        archivesCount: 0,
        notesCount: 0,
        dailyEmailCount: 3,
        lastEmailDate: yesterdayStr,
      };

      setGuestUsage(usage);

      resetDailyEmailCount();

      const updated = getGuestUsage();
      expect(updated.dailyEmailCount).toBe(0);
      expect(updated.lastEmailDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('같은 날짜면 dailyEmailCount를 유지한다', () => {
      const today = new Date().toISOString().split('T')[0];

      const usage: GuestUsage = {
        templatesCount: 0,
        archivesCount: 0,
        notesCount: 0,
        dailyEmailCount: 2,
        lastEmailDate: today,
      };

      setGuestUsage(usage);

      resetDailyEmailCount();

      const updated = getGuestUsage();
      expect(updated.dailyEmailCount).toBe(2);
      expect(updated.lastEmailDate).toBe(today);
    });
  });

  describe('canCreateTemplate() - 템플릿 생성 가능 여부', () => {
    it('0개 사용 시 생성 가능하다', () => {
      expect(canCreateTemplate()).toBe(true);
    });

    it('1개 사용 시 생성 불가능하다', () => {
      const usage = getGuestUsage();
      usage.templatesCount = 1;
      setGuestUsage(usage);

      expect(canCreateTemplate()).toBe(false);
    });

    it('제한 초과 시 생성 불가능하다', () => {
      const usage = getGuestUsage();
      usage.templatesCount = 2;
      setGuestUsage(usage);

      expect(canCreateTemplate()).toBe(false);
    });
  });

  describe('canCreateArchive() - 아카이브 생성 가능 여부', () => {
    it('0개 사용 시 생성 가능하다', () => {
      expect(canCreateArchive()).toBe(true);
    });

    it('9개 사용 시 생성 가능하다', () => {
      const usage = getGuestUsage();
      usage.archivesCount = 9;
      setGuestUsage(usage);

      expect(canCreateArchive()).toBe(true);
    });

    it('10개 사용 시 생성 불가능하다', () => {
      const usage = getGuestUsage();
      usage.archivesCount = 10;
      setGuestUsage(usage);

      expect(canCreateArchive()).toBe(false);
    });

    it('제한 초과 시 생성 불가능하다', () => {
      const usage = getGuestUsage();
      usage.archivesCount = 11;
      setGuestUsage(usage);

      expect(canCreateArchive()).toBe(false);
    });
  });

  describe('canCreateNote() - 노트 생성 가능 여부', () => {
    it('0개 사용 시 생성 가능하다', () => {
      expect(canCreateNote()).toBe(true);
    });

    it('4개 사용 시 생성 가능하다', () => {
      const usage = getGuestUsage();
      usage.notesCount = 4;
      setGuestUsage(usage);

      expect(canCreateNote()).toBe(true);
    });

    it('5개 사용 시 생성 불가능하다', () => {
      const usage = getGuestUsage();
      usage.notesCount = 5;
      setGuestUsage(usage);

      expect(canCreateNote()).toBe(false);
    });
  });

  describe('canGenerateEmail() - 이메일 생성 가능 여부', () => {
    it('0회 사용 시 생성 가능하다', () => {
      expect(canGenerateEmail()).toBe(true);
    });

    it('2회 사용 시 생성 가능하다', () => {
      const today = new Date().toISOString().split('T')[0];
      const usage = getGuestUsage();
      usage.dailyEmailCount = 2;
      usage.lastEmailDate = today;
      setGuestUsage(usage);

      expect(canGenerateEmail()).toBe(true);
    });

    it('3회 사용 시 생성 불가능하다', () => {
      const today = new Date().toISOString().split('T')[0];
      const usage = getGuestUsage();
      usage.dailyEmailCount = 3;
      usage.lastEmailDate = today;
      setGuestUsage(usage);

      expect(canGenerateEmail()).toBe(false);
    });

    it('날짜가 바뀌면 다시 생성 가능하다', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const usage = getGuestUsage();
      usage.dailyEmailCount = 3;
      usage.lastEmailDate = yesterdayStr;
      setGuestUsage(usage);

      expect(canGenerateEmail()).toBe(true);
    });
  });

  describe('incrementTemplateCount() - 템플릿 카운트 증가', () => {
    it('카운트를 1 증가시킨다', () => {
      incrementTemplateCount();

      const usage = getGuestUsage();
      expect(usage.templatesCount).toBe(1);
    });

    it('여러 번 호출하면 누적된다', () => {
      incrementTemplateCount();
      incrementTemplateCount();

      const usage = getGuestUsage();
      expect(usage.templatesCount).toBe(2);
    });
  });

  describe('decrementTemplateCount() - 템플릿 카운트 감소', () => {
    it('카운트를 1 감소시킨다', () => {
      const usage = getGuestUsage();
      usage.templatesCount = 2;
      setGuestUsage(usage);

      decrementTemplateCount();

      const updated = getGuestUsage();
      expect(updated.templatesCount).toBe(1);
    });

    it('0 이하로 내려가지 않는다', () => {
      const usage = getGuestUsage();
      usage.templatesCount = 0;
      setGuestUsage(usage);

      decrementTemplateCount();

      const updated = getGuestUsage();
      expect(updated.templatesCount).toBe(0);
    });
  });

  describe('incrementArchiveCount() - 아카이브 카운트 증가', () => {
    it('카운트를 1 증가시킨다', () => {
      incrementArchiveCount();

      const usage = getGuestUsage();
      expect(usage.archivesCount).toBe(1);
    });

    it('여러 번 호출하면 누적된다', () => {
      incrementArchiveCount();
      incrementArchiveCount();
      incrementArchiveCount();

      const usage = getGuestUsage();
      expect(usage.archivesCount).toBe(3);
    });
  });

  describe('decrementArchiveCount() - 아카이브 카운트 감소', () => {
    it('카운트를 1 감소시킨다', () => {
      const usage = getGuestUsage();
      usage.archivesCount = 5;
      setGuestUsage(usage);

      decrementArchiveCount();

      const updated = getGuestUsage();
      expect(updated.archivesCount).toBe(4);
    });

    it('0 이하로 내려가지 않는다', () => {
      const usage = getGuestUsage();
      usage.archivesCount = 0;
      setGuestUsage(usage);

      decrementArchiveCount();

      const updated = getGuestUsage();
      expect(updated.archivesCount).toBe(0);
    });
  });

  describe('incrementNoteCount() - 노트 카운트 증가', () => {
    it('카운트를 1 증가시킨다', () => {
      incrementNoteCount();

      const usage = getGuestUsage();
      expect(usage.notesCount).toBe(1);
    });

    it('여러 번 호출하면 누적된다', () => {
      incrementNoteCount();
      incrementNoteCount();

      const usage = getGuestUsage();
      expect(usage.notesCount).toBe(2);
    });
  });

  describe('decrementNoteCount() - 노트 카운트 감소', () => {
    it('카운트를 1 감소시킨다', () => {
      const usage = getGuestUsage();
      usage.notesCount = 3;
      setGuestUsage(usage);

      decrementNoteCount();

      const updated = getGuestUsage();
      expect(updated.notesCount).toBe(2);
    });

    it('0 이하로 내려가지 않는다', () => {
      const usage = getGuestUsage();
      usage.notesCount = 0;
      setGuestUsage(usage);

      decrementNoteCount();

      const updated = getGuestUsage();
      expect(updated.notesCount).toBe(0);
    });
  });

  describe('incrementEmailCount() - 이메일 카운트 증가', () => {
    it('카운트를 1 증가시키고 날짜를 업데이트한다', () => {
      incrementEmailCount();

      const usage = getGuestUsage();
      expect(usage.dailyEmailCount).toBe(1);
      expect(usage.lastEmailDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('여러 번 호출하면 누적된다', () => {
      incrementEmailCount();
      incrementEmailCount();

      const usage = getGuestUsage();
      expect(usage.dailyEmailCount).toBe(2);
    });

    it('날짜가 바뀌면 카운트를 초기화한다', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const usage = getGuestUsage();
      usage.dailyEmailCount = 3;
      usage.lastEmailDate = yesterdayStr;
      setGuestUsage(usage);

      incrementEmailCount();

      const updated = getGuestUsage();
      expect(updated.dailyEmailCount).toBe(1);
      expect(updated.lastEmailDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('통합 시나리오', () => {
    it('템플릿 생성 → 제한 확인 → 삭제 → 다시 생성 가능', () => {
      expect(canCreateTemplate()).toBe(true);

      incrementTemplateCount();

      expect(canCreateTemplate()).toBe(false);

      decrementTemplateCount();

      expect(canCreateTemplate()).toBe(true);
    });

    it('아카이브를 제한까지 생성할 수 있다', () => {
      for (let i = 0; i < GUEST_LIMITS.ARCHIVES; i++) {
        expect(canCreateArchive()).toBe(true);
        incrementArchiveCount();
      }

      expect(canCreateArchive()).toBe(false);
    });

    it('노트를 제한까지 생성할 수 있다', () => {
      for (let i = 0; i < GUEST_LIMITS.NOTES; i++) {
        expect(canCreateNote()).toBe(true);
        incrementNoteCount();
      }

      expect(canCreateNote()).toBe(false);
    });

    it('이메일을 일일 제한까지 생성할 수 있다', () => {
      for (let i = 0; i < GUEST_LIMITS.DAILY_EMAIL_GENERATION; i++) {
        expect(canGenerateEmail()).toBe(true);
        incrementEmailCount();
      }

      expect(canGenerateEmail()).toBe(false);
    });

    it('모든 리소스를 함께 관리할 수 있다', () => {
      // 템플릿 생성
      incrementTemplateCount();
      expect(canCreateTemplate()).toBe(false);

      // 아카이브 여러 개 생성
      for (let i = 0; i < 5; i++) {
        incrementArchiveCount();
      }
      expect(canCreateArchive()).toBe(true);

      // 노트 생성
      incrementNoteCount();
      incrementNoteCount();
      expect(canCreateNote()).toBe(true);

      // 이메일 생성
      incrementEmailCount();
      expect(canGenerateEmail()).toBe(true);

      // 사용량 확인
      const usage = getGuestUsage();
      expect(usage.templatesCount).toBe(1);
      expect(usage.archivesCount).toBe(5);
      expect(usage.notesCount).toBe(2);
      expect(usage.dailyEmailCount).toBe(1);
    });
  });
});
