import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') ?? '';

  const r = await fetch(`${API_BASE}/v1/auth/logout`, {
    method: 'POST',
    headers: { cookie },
  });

  const res = NextResponse.json(null, { status: r.status });

  const setCookie = r.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }

  return res;
}
