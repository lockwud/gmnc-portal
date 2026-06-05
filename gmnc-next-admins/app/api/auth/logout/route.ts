import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/session';

/**
 * Builds a Set-Cookie header value that definitively expires a cookie.
 * Using both Max-Age=0 and Expires=epoch ensures compatibility across all browsers.
 */
function buildExpiredCookieHeader(name: string): string {
  return `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${sessionCookieOptions.secure ? '; Secure' : ''}`;
}

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Explicitly expire both auth cookies using raw Set-Cookie headers
  // so the browser discards them even if the path/domain wasn't stored correctly.
  response.headers.append('Set-Cookie', buildExpiredCookieHeader(ACCESS_TOKEN_COOKIE));
  response.headers.append('Set-Cookie', buildExpiredCookieHeader(SESSION_COOKIE));

  // Belt-and-suspenders: also use the Next.js cookie API with explicit options
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  // Prevent any caching of the logout response
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  return response;
}
