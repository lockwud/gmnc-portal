import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

async function fetchWithBootstrap(
  url: string,
  method: string,
  authHeader: Record<string, string>,
  body?: string,
) {
  const response = await fetch(url, {
    method,
    headers: authHeader,
    ...(body ? { body } : {}),
    cache: 'no-store',
  });

  if (response.status === 403) {
    console.log('[Delete] 403 on backend. Retrying after admin bootstrap...');
    try {
      await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
        method: 'POST',
        headers: authHeader,
      });

      return fetch(url, {
        method,
        headers: authHeader,
        ...(body ? { body } : {}),
        cache: 'no-store',
      });
    } catch (err) {
      console.error('[Delete] Admin bootstrap failed:', err);
    }
  }

  return response;
}

export async function POST(request: NextRequest) {
  let payload: { userId?: string; type?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (!payload.userId || !payload.type) {
    return NextResponse.json({ success: false, message: 'userId and type are required' }, { status: 400 });
  }

  if (!env.API_BASE_URL) {
    return NextResponse.json(
      { success: false, message: 'API base URL not configured' },
      { status: 500 },
    );
  }

  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const backendUrl = `${env.API_BASE_URL}/user/delete-account`;
    const userType = payload.type;
    const body = JSON.stringify({ userId: payload.userId, userType, type: userType });

    console.log(`[Delete] Admin-initiated delete via: ${backendUrl}`);
    const response = await fetchWithBootstrap(backendUrl, 'POST', authHeader, body);

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Delete] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('[Delete] Request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
