import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data, { status: 200 });
}
