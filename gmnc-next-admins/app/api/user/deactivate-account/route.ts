import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE, sessionCookieOptions, deserializeSessionUser } from '@/lib/session';

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

function getCurrentUserId(request: NextRequest): string | null {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionCookie) {
    const user = deserializeSessionUser(sessionCookie);
    if (user?.id) return user.id;
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (token) {
    try {
      const payloadPart = token.split('.')[1];
      if (payloadPart) {
        const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Record<string, unknown>;
        if (typeof decoded.sub === 'string') return decoded.sub;
        if (typeof decoded.id === 'string') return decoded.id;
      }
    } catch {
      // Ignore decode errors
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  // Parse request body (may be empty for self-deactivation or contain userId for admin deactivation)
  let payload: { userId?: string; userType?: string; type?: string } = {};
  try {
    payload = await request.json();
  } catch {
    // No JSON body provided (self-deactivation)
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userId = payload.userId;
  const userType = payload.userType || payload.type;
  const isSelfDeactivation = !userId;

  if (!isSelfDeactivation) {
    const currentUserId = getCurrentUserId(request);
    if (currentUserId && currentUserId === userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot deactivate your own account through this endpoint.' },
        { status: 400 },
      );
    }

    if (userType === 'CAREGIVER' || userType === 'SERVICE_PROVIDER') {
      return NextResponse.json(
        { success: false, message: 'Caregiver and Provider accounts must be deleted via the delete endpoint.' },
        { status: 400 },
      );
    }
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
    const backendUrl = `${env.API_BASE_URL}/user/deactivate-account`;
    const body = isSelfDeactivation ? undefined : JSON.stringify({ userId, userType, type: userType });

    console.log(`[Deactivate] ${isSelfDeactivation ? 'Self' : 'Admin'}-deactivation via: ${backendUrl}`);
    const response = await fetchWithBootstrap(backendUrl, 'POST', authHeader, body);

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

    if (response.ok && isSelfDeactivation) {
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
// go through the code for the deactivation and how it functions becuase the self deactivation is still working on only the admin while it should take effect on all the users(admin, caregiver, provider), the admin has full control on the users and can deactivate their accounts but whenever the admin tries to delete a user(caregiver or provider) then it turns to deactivate the admin why  