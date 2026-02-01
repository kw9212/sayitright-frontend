import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

/**
 * 범용 백엔드 API 프록시
 * 모든 /api/proxy/* 요청을 백엔드로 전달
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Proxy] ${method} ${backendUrl}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더 전달
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Cookie 전달
    const cookies = request.headers.get('Cookie');
    if (cookies) {
      headers.Cookie = cookies;
    }

    // 요청 옵션
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // GET/DELETE가 아니면 body 추가
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // body가 없을 수도 있음
      }
    }

    const response = await fetch(backendUrl, fetchOptions);

    // 응답 헤더 복사
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // CORS 관련 헤더는 제외
      if (!key.toLowerCase().startsWith('access-control-')) {
        responseHeaders.set(key, value);
      }
    });

    // JSON 응답인 경우
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // 텍스트 응답인 경우
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    // 에러는 항상 로깅 (프로덕션에서도 중요)
    console.error('[API Proxy] 에러:', {
      error: error instanceof Error ? error.message : error,
      method,
      path: pathSegments,
    });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'API 요청 처리 중 오류가 발생했습니다.',
        },
      },
      { status: 500 },
    );
  }
}
