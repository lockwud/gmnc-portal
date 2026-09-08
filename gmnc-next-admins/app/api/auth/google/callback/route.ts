import { NextRequest, NextResponse } from 'next/server';

import { requireApiBaseUrl } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  refreshCookieOptions,
  serializeSessionUser,
  sessionCookieOptions,
} from '@/lib/session';

/**
 * GET /api/auth/google/callback?code=…&state=…&codeVerifier=…
 * Completes Google OAuth: forwards the code plus the stored state/verifier
 * to the backend (which enforces state match and PKCE), then sets the same
 * session cookies as password login. If the backend redirect URI ever points
 * here directly, this also accepts ?code&state (verifier optional) so the
 * flow degrades gracefully instead of stranding the user.
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const code = params.get('code');
    const state = params.get('state');
    const codeVerifier = params.get('codeVerifier');

    if (!code || !state) {
      const url = new URL('/login?error=google', request.url);
      return NextResponse.redirect(url);
    }

    const backendResponse = await fetch(
      `${requireApiBaseUrl()}/auth/google/callback?${new URLSearchParams({
        code,
        state,
        ...(codeVerifier ? { codeVerifier } : {}),
      }).toString()}`,
      { method: 'GET', cache: 'no-store' },
    );

    if (!backendResponse.ok) {
      const url = new URL('/login?error=google', request.url);
      return NextResponse.redirect(url);
    }

    const backendData = await backendResponse.json();
    const data = backendData?.data ?? backendData;
    const accessToken = data?.accessToken;
    const user = data?.user;

    if (typeof accessToken !== 'string' || !user) {
      const url = new URL('/login?error=google', request.url);
      return NextResponse.redirect(url);
    }

    const targetRole = user?.userType === 'ADMIN' ? '/admin' : '/provider';
    const response = NextResponse.redirect(new URL(targetRole, request.url));

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, sessionCookieOptions);
    try {
      const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';
      response.cookies.set(
        SESSION_COOKIE,
        serializeSessionUser({
          id: String(user?.id ?? ''),
          email: typeof user?.email === 'string' ? user.email : null,
          name: displayName,
          roles: Array.isArray(user?.roles) ? user.roles : [],
          permissions: Array.isArray(user?.permissions) ? user.permissions : [],
          userType: user?.userType,
          avatar: null,
          terms: null,
        }),
        sessionCookieOptions,
      );
    } catch {
      // Non-fatal: /api/auth/me will rebuild the session on next load.
    }
    if (typeof data?.refreshToken === 'string') {
      response.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, refreshCookieOptions);
    }
    return response;
  } catch (error) {
    console.error('[API/AUTH/GOOGLE] Callback failed:', getErrorMessage(error));
    return NextResponse.redirect(new URL('/login?error=google', request.url));
  }
}
