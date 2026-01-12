import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function POST(req: Request) {
  const body = await req.json();

  const r = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  const data = text ? JSON.parse(text) : null;

  const res = NextResponse.json(data, { status: r.status });

  const setCookie = r.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }

  return res;
}
