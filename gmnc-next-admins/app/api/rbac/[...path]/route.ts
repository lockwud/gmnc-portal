import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function getToken(request: NextRequest) {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

/** Pass-through proxy for runtime RBAC checks (/rbac/check). */
async function proxyRbacRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await context.params;
  const url = new URL(request.url);
  const response = await fetch(
    `${requireApiBaseUrl()}/rbac/${(path ?? []).map(encodeURIComponent).join('/')}${url.search}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );

  const responseText = await response.text();
  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRbacRequest(request, context);
}
