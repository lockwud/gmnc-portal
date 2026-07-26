import { NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';

function authHeaders(request: Request): Record<string, string> {
  const authorization = request.headers.get('authorization');
  return authorization ? { Authorization: authorization } : {};
}

export async function POST(request: Request) {
  try {
    const apiBaseUrl = requireApiBaseUrl();
    const contentType = request.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json') ? await request.text() : await request.formData();
    const res = await fetch(`${apiBaseUrl}/signature/attach`, {
      method: 'POST',
      headers: {
        ...authHeaders(request),
        ...(contentType.includes('application/json') ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      credentials: 'include',
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'proxy error' }, { status: 500 });
  }
}
