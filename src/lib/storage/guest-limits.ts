/**
 * 게스트 모드 제한 정책
 */

export const GUEST_LIMITS = {
  TEMPLATES: 1, // 템플릿 1개
  ARCHIVES: 10, // 아카이브 10개
  NOTES: 5, // 노트 5개
  DAILY_EMAIL_GENERATION: 3, // 일일 이메일 생성 3회 (IP 기반)
} as const;

export interface GuestUsage {
  templatesCount: number;
  archivesCount: number;
  notesCount: number;
  dailyEmailCount: number;
  lastEmailDate: string; // YYYY-MM-DD
}

const GUEST_USAGE_KEY = 'guest_usage';

export function getGuestUsage(): GuestUsage {
  if (typeof window === 'undefined') {
    return {
      templatesCount: 0,
      archivesCount: 0,
      notesCount: 0,
      dailyEmailCount: 0,
      lastEmailDate: '',
    };
  }

  const stored = localStorage.getItem(GUEST_USAGE_KEY);
  if (!stored) {
    return {
      templatesCount: 0,
      archivesCount: 0,
      notesCount: 0,
      dailyEmailCount: 0,
      lastEmailDate: '',
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      templatesCount: 0,
      archivesCount: 0,
      notesCount: 0,
      dailyEmailCount: 0,
      lastEmailDate: '',
    };
  }
}

export function setGuestUsage(usage: GuestUsage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
}

export function resetDailyEmailCount(): void {
  const usage = getGuestUsage();
  const today = new Date().toISOString().split('T')[0];

  if (usage.lastEmailDate !== today) {
    usage.dailyEmailCount = 0;
    usage.lastEmailDate = today;
    setGuestUsage(usage);
  }
}

export function canCreateTemplate(): boolean {
  const usage = getGuestUsage();
  return usage.templatesCount < GUEST_LIMITS.TEMPLATES;
}

export function canCreateArchive(): boolean {
  const usage = getGuestUsage();
  return usage.archivesCount < GUEST_LIMITS.ARCHIVES;
}

export function canCreateNote(): boolean {
  const usage = getGuestUsage();
  return usage.notesCount < GUEST_LIMITS.NOTES;
}

export function canGenerateEmail(): boolean {
  resetDailyEmailCount();
  const usage = getGuestUsage();
  return usage.dailyEmailCount < GUEST_LIMITS.DAILY_EMAIL_GENERATION;
}

export function incrementTemplateCount(): void {
  const usage = getGuestUsage();
  usage.templatesCount += 1;
  setGuestUsage(usage);
}

export function decrementTemplateCount(): void {
  const usage = getGuestUsage();
  usage.templatesCount = Math.max(0, usage.templatesCount - 1);
  setGuestUsage(usage);
}

export function incrementArchiveCount(): void {
  const usage = getGuestUsage();
  usage.archivesCount += 1;
  setGuestUsage(usage);
}

export function decrementArchiveCount(): void {
  const usage = getGuestUsage();
  usage.archivesCount = Math.max(0, usage.archivesCount - 1);
  setGuestUsage(usage);
}

export function incrementNoteCount(): void {
  const usage = getGuestUsage();
  usage.notesCount += 1;
  setGuestUsage(usage);
}

export function decrementNoteCount(): void {
  const usage = getGuestUsage();
  usage.notesCount = Math.max(0, usage.notesCount - 1);
  setGuestUsage(usage);
}

export function incrementEmailCount(): void {
  resetDailyEmailCount();
  const usage = getGuestUsage();
  usage.dailyEmailCount += 1;
  usage.lastEmailDate = new Date().toISOString().split('T')[0];
  setGuestUsage(usage);
}
