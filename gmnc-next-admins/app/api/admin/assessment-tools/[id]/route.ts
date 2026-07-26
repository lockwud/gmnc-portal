import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function getToken(request: NextRequest) {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const response = await fetch(`${requireApiBaseUrl()}/admin/assessment-tools/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    },
    body: await request.text(),
    cache: 'no-store',
  });

  const responseText = await response.text();
  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}
