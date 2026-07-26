import { NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';

function authHeaders(request: Request): Record<string, string> {
  const authorization = request.headers.get('authorization');
  return authorization ? { Authorization: authorization } : {};
}

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const apiBaseUrl = requireApiBaseUrl();
    const { userId } = await params;
    const res = await fetch(`${apiBaseUrl}/signature/${encodeURIComponent(userId)}`, {
      credentials: 'include',
      headers: authHeaders(request),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'proxy error' }, { status: 500 });
  }
}
