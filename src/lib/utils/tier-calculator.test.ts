import {
  getUserTier,
  canUseAdvancedFeatures,
  getDailyRequestLimit,
  getInputLimitByTier,
  getTierDisplayName,
  getTierBadgeColor,
  type UserTier,
} from './tier-calculator';

describe('tier-calculator 유틸리티', () => {
  describe('getUserTier', () => {
    it('user가 null이면 guest를 반환한다', () => {
      const tier = getUserTier(null);
      expect(tier).toBe('guest');
    });

    it('user.tier가 free이면 free를 반환한다', () => {
      const tier = getUserTier({ tier: 'free' });
      expect(tier).toBe('free');
    });

    it('user.tier가 premium이면 premium을 반환한다', () => {
      const tier = getUserTier({ tier: 'premium' });
      expect(tier).toBe('premium');
    });

    it('tier가 없지만 creditBalance가 있으면 premium을 반환한다', () => {
      const tier = getUserTier({ creditBalance: 100 });
      expect(tier).toBe('premium');
    });

    it('tier도 없고 creditBalance도 0이면 free를 반환한다', () => {
      const tier = getUserTier({ creditBalance: 0 });
      expect(tier).toBe('free');
    });

    it('tier도 없고 creditBalance도 없으면 free를 반환한다', () => {
      const tier = getUserTier({});
      expect(tier).toBe('free');
    });
  });

  describe('canUseAdvancedFeatures', () => {
    it('guest는 체험 모드로 고급 기능을 사용할 수 있다', () => {
      const result = canUseAdvancedFeatures('guest');
      expect(result.allowed).toBe(true);
      expect(result.message).toContain('체험 모드');
    });

    it('free 유저는 고급 기능을 사용할 수 없다', () => {
      const result = canUseAdvancedFeatures('free');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Premium');
    });

    it('premium 유저는 크레딧이 있으면 고급 기능을 사용할 수 있다', () => {
      const result = canUseAdvancedFeatures('premium', 100);
      expect(result.allowed).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('premium 유저도 크레딧이 0이면 고급 기능을 사용할 수 없다', () => {
      const result = canUseAdvancedFeatures('premium', 0);
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('크레딧');
    });

    it('creditBalance를 제공하지 않으면 기본값 0으로 처리한다', () => {
      const result = canUseAdvancedFeatures('premium');
      expect(result.allowed).toBe(false);
    });
  });

  describe('getDailyRequestLimit', () => {
    it('guest는 하루 3번 요청할 수 있다', () => {
      const limit = getDailyRequestLimit('guest');
      expect(limit).toBe(3);
    });

    it('free는 하루 10번 요청할 수 있다', () => {
      const limit = getDailyRequestLimit('free');
      expect(limit).toBe(10);
    });

    it('premium은 하루 100번 요청할 수 있다', () => {
      const limit = getDailyRequestLimit('premium');
      expect(limit).toBe(100);
    });

    it('잘못된 tier는 0을 반환한다', () => {
      const limit = getDailyRequestLimit('invalid' as UserTier);
      expect(limit).toBe(0);
    });
  });

  describe('getInputLimitByTier', () => {
    it('guest는 150자까지 입력할 수 있다', () => {
      const limit = getInputLimitByTier('guest');
      expect(limit).toBe(150);
    });

    it('free는 300자까지 입력할 수 있다', () => {
      const limit = getInputLimitByTier('free');
      expect(limit).toBe(300);
    });

    it('premium은 600자까지 입력할 수 있다', () => {
      const limit = getInputLimitByTier('premium');
      expect(limit).toBe(600);
    });
  });

  describe('getTierDisplayName', () => {
    it('guest는 "게스트"로 표시한다', () => {
      const name = getTierDisplayName('guest');
      expect(name).toBe('게스트');
    });

    it('free는 "무료"로 표시한다', () => {
      const name = getTierDisplayName('free');
      expect(name).toBe('무료');
    });

    it('premium은 "프리미엄"으로 표시한다', () => {
      const name = getTierDisplayName('premium');
      expect(name).toBe('프리미엄');
    });

    it('잘못된 tier는 "알 수 없음"으로 표시한다', () => {
      const name = getTierDisplayName('invalid' as UserTier);
      expect(name).toBe('알 수 없음');
    });
  });

  describe('getTierBadgeColor', () => {
    it('guest는 회색 배지를 사용한다', () => {
      const color = getTierBadgeColor('guest');
      expect(color).toBe('bg-gray-500');
    });

    it('free는 파란색 배지를 사용한다', () => {
      const color = getTierBadgeColor('free');
      expect(color).toBe('bg-blue-500');
    });

    it('premium은 노란색 배지를 사용한다', () => {
      const color = getTierBadgeColor('premium');
      expect(color).toBe('bg-yellow-500');
    });

    it('잘못된 tier는 회색 배지를 사용한다', () => {
      const color = getTierBadgeColor('invalid' as UserTier);
      expect(color).toBe('bg-gray-500');
    });
  });

  describe('통합 시나리오 테스트', () => {
    it('신규 게스트 사용자의 권한을 확인한다', () => {
      const user = null;
      const tier = getUserTier(user);
      const limit = getDailyRequestLimit(tier);
      const inputLimit = getInputLimitByTier(tier);
      const features = canUseAdvancedFeatures(tier);

      expect(tier).toBe('guest');
      expect(limit).toBe(3);
      expect(inputLimit).toBe(150);
      expect(features.allowed).toBe(true);
    });

    it('무료 회원의 권한을 확인한다', () => {
      const user = { tier: 'free' as const };
      const tier = getUserTier(user);
      const limit = getDailyRequestLimit(tier);
      const inputLimit = getInputLimitByTier(tier);
      const features = canUseAdvancedFeatures(tier);

      expect(tier).toBe('free');
      expect(limit).toBe(10);
      expect(inputLimit).toBe(300);
      expect(features.allowed).toBe(false);
    });

    it('프리미엄 회원의 권한을 확인한다', () => {
      const user = { tier: 'premium' as const, creditBalance: 1000 };
      const tier = getUserTier(user);
      const limit = getDailyRequestLimit(tier);
      const inputLimit = getInputLimitByTier(tier);
      const features = canUseAdvancedFeatures(tier, user.creditBalance);

      expect(tier).toBe('premium');
      expect(limit).toBe(100);
      expect(inputLimit).toBe(600);
      expect(features.allowed).toBe(true);
    });
  });
});
