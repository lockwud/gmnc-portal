import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
  deserializeSessionUser,
  sessionCookieOptions,
} from '@/lib/session';

const expiredCookieOptions = {
  ...sessionCookieOptions,
  maxAge: 0,
  expires: new Date(0),
} as const;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const cookieSessionUser = deserializeSessionUser(cookieStore.get(SESSION_COOKIE)?.value);

  const authHeader = request.headers.get('Authorization');
  const headerAccessToken = authHeader?.replace(/^Bearer\s+/i, '');

  const accessToken = cookieAccessToken ?? headerAccessToken;

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
    const backendResponse = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      // Backend returned error — fall back to session cookie if available
      if (cookieSessionUser) {
        return NextResponse.json({
          user: cookieSessionUser,
          accessToken,
          success: true,
        });
      }

      const res = NextResponse.json(
        { user: null, success: false },
        { status: 401 },
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
      res.cookies.set(SESSION_COOKIE, JSON.stringify(freshUser), sessionCookieOptions);
      return res;
    }

    // If backend didn't return user data, fall back to session
    if (cookieSessionUser) {
      return NextResponse.json({
        user: cookieSessionUser,
        accessToken,
        success: true,
      });
    }

    return NextResponse.json(
      { user: null, success: false },
      { status: 401 },
    );
  } catch (error) {
    // Backend unreachable — fall back to session cookie
    if (cookieSessionUser) {
      return NextResponse.json({
        user: cookieSessionUser,
        accessToken,
        success: true,
      });
    }

    const res = NextResponse.json(
      { user: null, success: false },
      { status: 401 },
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
    res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
    return res;
  }
}