import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') ?? '';
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/refresh`, {
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
