import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
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
  try {
    const backendResponse = await fetch(`${requireApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const res = NextResponse.json(
        { user: null, success: false },
        { status: backendResponse.status },
      );
      res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
      res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
      return res;
    }

    const backendData = await backendResponse.json();
    const freshUser = backendData?.data?.user || backendData?.user;

    if (freshUser) {
      // Update the session cookie with fresh data
      const res = NextResponse.json({
        user: freshUser,
        accessToken,
        success: true,
      });
      res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, sessionCookieOptions);
      res.cookies.set(SESSION_COOKIE, JSON.stringify(freshUser), sessionCookieOptions);
      return res;
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
