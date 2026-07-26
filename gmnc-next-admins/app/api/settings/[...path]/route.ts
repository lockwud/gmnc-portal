import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function getToken(request: NextRequest) {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

async function proxySettingsRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await context.params;
  const url = new URL(request.url);
  const encodedPath = path.map(encodeURIComponent).join('/');
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const response = await fetch(`${requireApiBaseUrl()}/settings/${encodedPath}${url.search}`, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const responseText = await response.text();
  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxySettingsRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxySettingsRequest(request, context);
}
