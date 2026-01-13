export const INPUT_VALIDATION = {
  MAX_CUSTOM_INPUT_LENGTH: 50,
  MAX_DRAFT_LENGTH: 600,
};

export function validateCustomInput(input: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: '입력이 비어있습니다.' };
  }

  const sanitized = input.trim();
  if (sanitized.length > INPUT_VALIDATION.MAX_CUSTOM_INPUT_LENGTH) {
    return {
      isValid: false,
      error: `최대 ${INPUT_VALIDATION.MAX_CUSTOM_INPUT_LENGTH}자까지 입력 가능합니다.`,
    };
  }

  if (/[\x00-\x1F\x7F]/.test(sanitized)) {
    return { isValid: false, error: '제어 문자는 사용할 수 없습니다.' };
  }

  const forbiddenPatterns = [
    /---[A-Z\s]+---/gi,
    /\[SYSTEM\]/gi,
    /\[ASSISTANT\]/gi,
    /ignore\s+(previous|all|above)/gi,
    /forget\s+(everything|instructions)/gi,
    /new\s+(role|instruction|system)/gi,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(sanitized)) {
      return { isValid: false, error: '허용되지 않는 패턴이 포함되어 있습니다.' };
    }
  }

  if (!/^[\p{L}\p{N}\s.,!?'"()\-:/]+$/u.test(sanitized)) {
    return { isValid: false, error: '허용되지 않는 특수 문자가 포함되어 있습니다.' };
  }

  return { isValid: true, sanitized };
}

export function validateDraft(
  draft: string,
  maxLength: number,
): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!draft || typeof draft !== 'string') {
    return { isValid: false, error: '이메일 내용을 입력해주세요.' };
  }

  const sanitized = draft.trim();

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `최대 ${maxLength}자까지 입력 가능합니다.`,
    };
  }

  if (sanitized.length < 10) {
    return {
      isValid: false,
      error: '최소 10자 이상 입력해주세요.',
    };
  }

  const forbiddenPatterns = [/---[A-Z\s]+---/gi, /\[SYSTEM\]/gi, /ignore\s+previous/gi];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        error: '의심스러운 패턴이 감지되었습니다. 일반적인 이메일 내용을 입력해주세요.',
      };
    }
  }

  return { isValid: true, sanitized };
}

export function autoSanitizeInput(input: string, maxLength: number): string {
  let sanitized = input;
  sanitized = sanitized.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
