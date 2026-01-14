export type UserTier = 'guest' | 'free' | 'premium';

export function getUserTier(
  user: {
    tier?: 'free' | 'premium';
    creditBalance?: number;
  } | null,
): UserTier {
  if (!user) {
    return 'guest';
  }

  if (user.tier) {
    return user.tier;
  }

  if (user.creditBalance && user.creditBalance > 0) {
    return 'premium';
  }

  return 'free';
}

export function canUseAdvancedFeatures(
  tier: UserTier,
  creditBalance: number = 0,
): {
  allowed: boolean;
  message?: string;
} {
  if (tier === 'guest') {
    return {
      allowed: true,
      message: '체험 모드입니다. 로그인하면 더 많은 기능을 사용할 수 있습니다.',
    };
  }

  if (tier === 'free') {
    return {
      allowed: false,
      message: '고급 기능은 Premium 유저만 사용할 수 있습니다.',
    };
  }

  if (tier === 'premium' && creditBalance === 0) {
    return {
      allowed: false,
      message: '크레딧이 부족합니다. 충전이 필요합니다.',
    };
  }

  return {
    allowed: true,
  };
}

export function getDailyRequestLimit(tier: UserTier): number {
  switch (tier) {
    case 'guest':
      return 3;
    case 'free':
      return 10;
    case 'premium':
      return 100;
    default:
      return 0;
  }
}

export function getInputLimitByTier(tier: UserTier): number {
  const limits = {
    guest: 150,
    free: 300,
    premium: 600,
  };

  return limits[tier];
}
export function getTierDisplayName(tier: UserTier): string {
  switch (tier) {
    case 'guest':
      return '게스트';
    case 'free':
      return '무료';
    case 'premium':
      return '프리미엄';
    default:
      return '알 수 없음';
  }
}

export function getTierBadgeColor(tier: UserTier): string {
  switch (tier) {
    case 'guest':
      return 'bg-gray-500';
    case 'free':
      return 'bg-blue-500';
    case 'premium':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}
