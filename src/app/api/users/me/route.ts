import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/v1/users/me`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  // 백엔드가 이미 { ok: true, data: user } 형태로 반환하므로 그대로 전달
  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/v1/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data, { status: 200 });
}
