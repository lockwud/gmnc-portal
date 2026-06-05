import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

function buildExpiredCookieHeader(name: string): string {
  return `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${sessionCookieOptions.secure ? '; Secure' : ''}`;
}

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
    console.log('[Deactivate] 403 on backend. Retrying after admin bootstrap...');
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
      console.error('[Deactivate] Admin bootstrap failed:', err);
    }
  }

  return response;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  // Parse request body (may be empty for self-deactivation)
  let payload: { userId?: string; isSelf?: boolean } = {};
  try {
    payload = await request.json();
  } catch {
    // No JSON body provided (self-deactivation)
  }

  const userId = payload.userId;

  if (!env.API_BASE_URL) {
    return NextResponse.json(
      { success: false, message: 'API base URL not configured' },
      { status: 500 },
    );
  }

  // Prepare backend request
  const backendUrl = `${env.API_BASE_URL}/user/deactivate-account`;
  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetchWithBootstrap(
      backendUrl,
      'POST',
      authHeader,
      JSON.stringify({ userId }),
    );
    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Deactivate] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (response.ok && !payload.userId) {
      // Clear cookies only for self-deactivation (log out the user)
      nextResponse.headers.append('Set-Cookie', buildExpiredCookieHeader(ACCESS_TOKEN_COOKIE));
      nextResponse.headers.append('Set-Cookie', buildExpiredCookieHeader(SESSION_COOKIE));

      nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0, expires: new Date(0) });
      nextResponse.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0, expires: new Date(0) });
    }

    return nextResponse;
  } catch (error) {
    console.error('[Deactivate] Request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to deactivate account' },
      { status: 500 },
    );
  }
}
