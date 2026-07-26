import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const response = await fetch(`${requireApiBaseUrl()}/cp-patient${url.search}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const responseText = await response.text();
  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}
