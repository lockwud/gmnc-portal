import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
  deserializeSessionUser,
  sessionCookieOptions,
} from '@/lib/session';

/** Cookie options that definitively expire a cookie. */
const expiredCookieOptions = {
  ...sessionCookieOptions,
  maxAge: 0,
  expires: new Date(0),
} as const;

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const sessionUser = deserializeSessionUser(cookieStore.get(SESSION_COOKIE)?.value);

  // Both cookies must be present and valid
  if (!sessionUser || !accessToken) {
    const res = NextResponse.json(
      { user: null, success: false },
      { status: 401 },
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
    res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
    return res;
  }

  // Return the session user from the cookie — the access token is attached
  // to all subsequent backend API calls by the individual route handlers.
  return NextResponse.json({
    user: sessionUser,
    accessToken,
    success: true,
  });
}