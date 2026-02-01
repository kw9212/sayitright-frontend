import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    const cookies = request.headers.get('Cookie');

    console.log('[API Proxy] 요청 시작:', {
      apiBaseUrl: API_BASE_URL,
      hasAuth: !!authHeader,
      hasCookies: !!cookies,
      bodyKeys: Object.keys(body),
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    if (cookies) {
      headers.Cookie = cookies;
    }

    const backendUrl = `${API_BASE_URL}/v1/ai/generate-email`;
    console.log('[API Proxy] 백엔드 호출:', backendUrl);

    // 백엔드 API 호출 (서버에서 HTTP 호출은 안전)
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[API Proxy] 백엔드 응답:', {
      status: response.status,
      ok: response.ok,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[API Proxy] 백엔드 에러:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] 프록시 에러:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      apiBaseUrl: API_BASE_URL,
    });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '이메일 생성 중 오류가 발생했습니다.',
        },
      },
      { status: 500 },
    );
  }
}
