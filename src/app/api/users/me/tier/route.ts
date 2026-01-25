import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function PUT(req: NextRequest) {
  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.get('authorization');
  let accessToken = authHeader?.replace('Bearer ', '');

  // Authorization 헤더가 없으면 쿠키에서 가져오기
  if (!accessToken) {
    const cookieStore = await cookies();
    accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
  }

  const body = await req.json();

  const r = await fetch(`${API_BASE_URL}/v1/users/me/tier`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => null);

  if (!r.ok) {
    return NextResponse.json(data || { ok: false }, { status: r.status });
  }

  return NextResponse.json(data, { status: 200 });
}
