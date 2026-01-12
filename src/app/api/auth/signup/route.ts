import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await r.json();

  if (!r.ok) {
    return NextResponse.json(data, { status: r.status });
  }

  return NextResponse.json(data, { status: 201 });
}
