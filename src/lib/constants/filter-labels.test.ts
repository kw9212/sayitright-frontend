import {
  TONE_LABELS,
  RELATIONSHIP_LABELS,
  PURPOSE_LABELS,
  getToneLabel,
  getRelationshipLabel,
  getPurposeLabel,
} from './filter-labels';

describe('filter-labels 유틸리티', () => {
  describe('TONE_LABELS 상수', () => {
    it('모든 톤 레이블을 포함한다', () => {
      expect(TONE_LABELS).toEqual({
        formal: '격식있는',
        polite: '공손한',
        casual: '캐주얼',
        friendly: '친근한',
        neutral: '중립적',
      });
    });

    it('5개의 톤 레이블이 있다', () => {
      expect(Object.keys(TONE_LABELS)).toHaveLength(5);
    });
  });

  describe('RELATIONSHIP_LABELS 상수', () => {
    it('모든 관계 레이블을 포함한다', () => {
      expect(RELATIONSHIP_LABELS).toEqual({
        professor: '교수님',
        supervisor: '상사',
        colleague: '동료',
        client: '고객',
        friend: '친구',
      });
    });

    it('5개의 관계 레이블이 있다', () => {
      expect(Object.keys(RELATIONSHIP_LABELS)).toHaveLength(5);
    });
  });

  describe('PURPOSE_LABELS 상수', () => {
    it('모든 목적 레이블을 포함한다', () => {
      expect(PURPOSE_LABELS).toEqual({
        request: '요청',
        apology: '사과',
        thank: '감사',
        inquiry: '문의',
        report: '보고',
      });
    });

    it('5개의 목적 레이블이 있다', () => {
      expect(Object.keys(PURPOSE_LABELS)).toHaveLength(5);
    });
  });

  describe('getToneLabel', () => {
    it('formal을 "격식있는"으로 변환한다', () => {
      expect(getToneLabel('formal')).toBe('격식있는');
    });

    it('polite를 "공손한"으로 변환한다', () => {
      expect(getToneLabel('polite')).toBe('공손한');
    });

    it('casual을 "캐주얼"로 변환한다', () => {
      expect(getToneLabel('casual')).toBe('캐주얼');
    });

    it('friendly를 "친근한"으로 변환한다', () => {
      expect(getToneLabel('friendly')).toBe('친근한');
    });

    it('neutral을 "중립적"으로 변환한다', () => {
      expect(getToneLabel('neutral')).toBe('중립적');
    });

    it('존재하지 않는 값은 그대로 반환한다', () => {
      expect(getToneLabel('unknown')).toBe('unknown');
    });

    it('빈 문자열은 그대로 반환한다', () => {
      expect(getToneLabel('')).toBe('');
    });
  });

  describe('getRelationshipLabel', () => {
    it('professor를 "교수님"으로 변환한다', () => {
      expect(getRelationshipLabel('professor')).toBe('교수님');
    });

    it('supervisor를 "상사"로 변환한다', () => {
      expect(getRelationshipLabel('supervisor')).toBe('상사');
    });

    it('colleague를 "동료"로 변환한다', () => {
      expect(getRelationshipLabel('colleague')).toBe('동료');
    });

    it('client를 "고객"으로 변환한다', () => {
      expect(getRelationshipLabel('client')).toBe('고객');
    });

    it('friend를 "친구"로 변환한다', () => {
      expect(getRelationshipLabel('friend')).toBe('친구');
    });

    it('존재하지 않는 값은 그대로 반환한다', () => {
      expect(getRelationshipLabel('stranger')).toBe('stranger');
    });

    it('빈 문자열은 그대로 반환한다', () => {
      expect(getRelationshipLabel('')).toBe('');
    });
  });

  describe('getPurposeLabel', () => {
    it('request를 "요청"으로 변환한다', () => {
      expect(getPurposeLabel('request')).toBe('요청');
    });

    it('apology를 "사과"로 변환한다', () => {
      expect(getPurposeLabel('apology')).toBe('사과');
    });

    it('thank를 "감사"로 변환한다', () => {
      expect(getPurposeLabel('thank')).toBe('감사');
    });

    it('inquiry를 "문의"로 변환한다', () => {
      expect(getPurposeLabel('inquiry')).toBe('문의');
    });

    it('report를 "보고"로 변환한다', () => {
      expect(getPurposeLabel('report')).toBe('보고');
    });

    it('존재하지 않는 값은 그대로 반환한다', () => {
      expect(getPurposeLabel('other')).toBe('other');
    });

    it('빈 문자열은 그대로 반환한다', () => {
      expect(getPurposeLabel('')).toBe('');
    });
  });

  describe('통합 시나리오', () => {
    it('이메일 필터 정보를 모두 변환할 수 있다', () => {
      const tone = 'formal';
      const relationship = 'professor';
      const purpose = 'request';

      expect(getToneLabel(tone)).toBe('격식있는');
      expect(getRelationshipLabel(relationship)).toBe('교수님');
      expect(getPurposeLabel(purpose)).toBe('요청');
    });

    it('일부 값이 없어도 처리할 수 있다', () => {
      const tone = 'polite';
      const relationship = '';
      const purpose = 'thank';

      expect(getToneLabel(tone)).toBe('공손한');
      expect(getRelationshipLabel(relationship)).toBe('');
      expect(getPurposeLabel(purpose)).toBe('감사');
    });
  });
});
