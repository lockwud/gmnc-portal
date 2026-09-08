import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  refreshCookieOptions,
  sessionCookieOptions,
} from '@/lib/session';
import { requireApiBaseUrl } from '@/lib/env';

const expiredCookieOptions = {
  ...sessionCookieOptions,
  maxAge: 0,
  expires: new Date(0),
} as const;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const authHeader = request.headers.get('Authorization');
  const headerAccessToken = authHeader?.replace(/^Bearer\s+/i, '');

  const accessToken = headerAccessToken ?? cookieAccessToken;

  if (!accessToken) {
    const res = NextResponse.json(
      { user: null, success: false },
      { status: 401 },
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
    res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
    return res;
  }

  // Always fetch fresh user data from the backend using the access token.
  // This ensures roles/permissions reflect the latest DB state, not stale session cookies.
  const fetchMe = (token: string) =>
    fetch(`${requireApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

  const forwardSession = (
    freshUser: unknown,
    token: string,
    refreshToken?: string,
  ) => {
    const res = NextResponse.json({
      user: freshUser,
      accessToken: token,
      success: true,
    });
    res.cookies.set(ACCESS_TOKEN_COOKIE, token, sessionCookieOptions);
    // The session cookie holds a JSON user object (not base64url) here for
    // backwards compatibility with existing readers.
    res.cookies.set(SESSION_COOKIE, JSON.stringify(freshUser), sessionCookieOptions);
    if (refreshToken) {
      res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
    }
    return res;
  };

  try {
    let backendResponse = await fetchMe(accessToken);

    // Access token expired but the 30-day refresh token may still be valid:
    // rotate once and retry before forcing a logout.
    if (backendResponse.status === 401) {
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
      const sessionRaw = cookieStore.get(SESSION_COOKIE)?.value;
      let userId: string | null = null;
      if (sessionRaw) {
        try {
          const parsed = JSON.parse(Buffer.from(sessionRaw, 'base64url').toString('utf8')) as { id?: unknown };
          userId = typeof parsed.id === 'string' ? parsed.id : null;
        } catch {
          try {
            const parsed = JSON.parse(sessionRaw) as { id?: unknown };
            userId = typeof parsed.id === 'string' ? parsed.id : null;
          } catch {
            userId = null;
          }
        }
      }
      if (refreshToken && userId) {
        try {
          const refreshResponse = await fetch(`${requireApiBaseUrl()}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken, userId }),
            cache: 'no-store',
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json() as {
              data?: { accessToken?: string; refreshToken?: string };
              accessToken?: string;
              refreshToken?: string;
            };
            const nextAccess = refreshData?.data?.accessToken ?? refreshData?.accessToken;
            const nextRefresh = refreshData?.data?.refreshToken ?? refreshData?.refreshToken;
            if (typeof nextAccess === 'string' && nextAccess.length > 0) {
              backendResponse = await fetchMe(nextAccess);
              if (backendResponse.ok) {
                const backendData = await backendResponse.json();
                const freshUser = backendData?.data?.user || backendData?.user;
                if (freshUser) {
                  return forwardSession(freshUser, nextAccess, typeof nextRefresh === 'string' ? nextRefresh : undefined);
                }
              }
            }
          }
        } catch {
          // Refresh failed — fall through to logout below.
        }
      }
    }

    if (!backendResponse.ok) {
      const res = NextResponse.json(
        { user: null, success: false },
        { status: backendResponse.status },
      );
      res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
      res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
      res.cookies.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions);
      return res;
    }

    const backendData = await backendResponse.json();
    const freshUser = backendData?.data?.user || backendData?.user;

    if (freshUser) {
      // Update the session cookie with fresh data
      return forwardSession(freshUser, accessToken);
    }

    return NextResponse.json(
      { user: null, success: false },
      { status: 502 },
    );
  } catch (error) {
    console.error('[API/AUTH/ME] Backend request failed:', error);
    const res = NextResponse.json(
      { user: null, success: false, message: 'Failed to reach backend session endpoint' },
      { status: 502 },
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
    res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
    return res;
  }
}
