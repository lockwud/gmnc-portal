import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { refreshTokenRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  refreshCookieOptions,
  serializeSessionUser,
  sessionCookieOptions,
} from '@/lib/session';

/**
 * POST /api/auth/refresh — rotates the backend session using the 30-day
 * refresh token cookie, without asking for credentials again. The refreshed
 * access token + rotated refresh token replace both cookies, and the fresh
 * user (with current roles/permissions/terms) replaces the session cookie.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    const sessionRaw = cookieStore.get(SESSION_COOKIE)?.value;

    let userId: string | null = null;
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(Buffer.from(sessionRaw, 'base64url').toString('utf8')) as { id?: unknown };
        userId = typeof parsed.id === 'string' ? parsed.id : null;
      } catch {
        userId = null;
      }
    }

    if (!refreshToken || !userId) {
      return NextResponse.json(
        { success: false, message: 'No refresh session available' },
        { status: 401 },
      );
    }

    const data = await refreshTokenRequest(refreshToken, userId);

    const response = NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
      terms: data.terms ?? null,
      reacceptanceRequired: data.terms?.reacceptanceRequired ?? false,
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, sessionCookieOptions);
    response.cookies.set(SESSION_COOKIE, serializeSessionUser(data.user), sessionCookieOptions);
    if (data.refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, refreshCookieOptions);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
