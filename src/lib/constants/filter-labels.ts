export const TONE_LABELS: Record<string, string> = {
  formal: '격식있는',
  polite: '공손한',
  casual: '캐주얼',
  friendly: '친근한',
  neutral: '중립적',
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  professor: '교수님',
  supervisor: '상사',
  colleague: '동료',
  client: '고객',
  friend: '친구',
};

export const PURPOSE_LABELS: Record<string, string> = {
  request: '요청',
  apology: '사과',
  thank: '감사',
  inquiry: '문의',
  report: '보고',
};

export function getToneLabel(value: string): string {
  return TONE_LABELS[value] || value;
}

export function getRelationshipLabel(value: string): string {
  return RELATIONSHIP_LABELS[value] || value;
}

export function getPurposeLabel(value: string): string {
  return PURPOSE_LABELS[value] || value;
}
