export type GenerateEmailRequest = {
  draft: string;
  language: 'ko' | 'en';
  relationship?: string;
  purpose?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeRationale?: boolean;
};

export type GenerateEmailResponse = {
  ok: boolean;
  data: {
    email: string;
    rationale?: string;
    appliedFilters: {
      language: 'ko' | 'en';
      relationship?: string;
      purpose?: string;
      tone?: string;
      length?: string;
    };
    metadata: {
      charactersUsed: number;
      tokensUsed: number;
      creditCharged: number;
      remainingCredits?: number;
    };
  };
};

export async function generateEmail(
  request: GenerateEmailRequest,
  accessToken?: string,
): Promise<GenerateEmailResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch('http://localhost:3001/v1/ai/generate-email', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: '이메일 생성 중 오류가 발생했습니다.',
    }));
    throw new Error(error.message || '이메일 생성 중 오류가 발생했습니다.');
  }

  return response.json();
}
