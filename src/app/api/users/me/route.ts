import { NextResponse } from 'next/server';

async function fetchMe(auth?: string) {
  return fetch(`${process.env.API_BASE_URL}/v1/users/me`, {
    headers: auth ? { Authorization: auth } : {},
  });
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? undefined;

  let r = await fetchMe(auth);

  if (r.status === 401) {
    const cookie = req.headers.get('cookie') ?? '';

    const refreshRes = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { cookie },
    });

    const refreshData = await refreshRes.json();

    if (!refreshRes.ok) {
      return NextResponse.json(refreshData, { status: refreshRes.status });
    }

    const newAccessToken = refreshData?.data?.accessToken;
    if (!newAccessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Refresh succeeded but no access token returned',
            details: null,
          },
        },
        { status: 401 },
      );
    }

    r = await fetchMe(`Bearer ${newAccessToken}`);

    const data2 = await r.json();
    const res2 = NextResponse.json(data2, { status: r.status });

    res2.headers.set('x-new-access-token', newAccessToken);

    const setCookie = refreshRes.headers.get('set-cookie');
    if (setCookie) res2.headers.set('set-cookie', setCookie);

    return res2;
  }

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
