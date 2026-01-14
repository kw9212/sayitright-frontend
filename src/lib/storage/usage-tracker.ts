type UsageData = {
  date: string;
  basicCount: number;
  advancedCount: number;
};

const USAGE_KEY_PREFIX = 'sir_usage_';

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getUsageKey(date?: string): string {
  const targetDate = date || getTodayString();
  return `${USAGE_KEY_PREFIX}${targetDate}`;
}

export function getTodayUsage(): UsageData {
  if (typeof window === 'undefined') {
    return { date: getTodayString(), basicCount: 0, advancedCount: 0 };
  }

  const today = getTodayString();
  const key = getUsageKey(today);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored) as UsageData;
    } catch {
      // 파싱 실패 시 초기화
    }
  }

  return { date: today, basicCount: 0, advancedCount: 0 };
}

export function checkUsageLimit(
  tier: 'guest' | 'free' | 'premium',
  isAdvanced: boolean,
): {
  allowed: boolean;
  remaining: number;
  limit: number;
  message?: string;
} {
  if (tier === 'premium') {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const usage = getTodayUsage();

  const limits = {
    guest: { basic: 3, advanced: 3 },
    free: { basic: 10, advanced: 5 },
  };

  const tierLimit = limits[tier];

  if (isAdvanced) {
    const limit = tierLimit.advanced;
    const current = usage.advancedCount;
    const remaining = limit - current;

    if (current >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        message: `오늘의 고급 기능 사용 횟수를 모두 사용했습니다. (${limit}회/일)`,
      };
    }

    return { allowed: true, remaining, limit };
  }

  const limit = tierLimit.basic;
  const current = usage.basicCount + usage.advancedCount;
  const remaining = limit - current;

  if (current >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      message: `오늘의 사용 횟수를 모두 사용했습니다. (${limit}회/일)`,
    };
  }

  return { allowed: true, remaining, limit };
}

export function incrementUsage(isAdvanced: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  const usage = getTodayUsage();
  const key = getUsageKey(usage.date);

  if (isAdvanced) {
    usage.advancedCount += 1;
  } else {
    usage.basicCount += 1;
  }

  localStorage.setItem(key, JSON.stringify(usage));
}

export function cleanupOldUsageData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(USAGE_KEY_PREFIX)) {
      const dateStr = key.replace(USAGE_KEY_PREFIX, '');
      const date = new Date(dateStr);

      if (date < sevenDaysAgo) {
        localStorage.removeItem(key);
      }
    }
  });
}

export function resetTodayUsage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const key = getUsageKey();
  localStorage.removeItem(key);
}
