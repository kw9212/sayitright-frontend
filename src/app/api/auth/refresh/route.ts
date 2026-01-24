import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') ?? '';
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const r = await fetch(`${apiUrl}/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      cookie,
    },
  });

  const data = await r.json();

  const res = NextResponse.json(data, { status: r.status });

  const setCookie = r.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }

  return res;
}
