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

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const cookieSessionUser = deserializeSessionUser(cookieStore.get(SESSION_COOKIE)?.value);

  const authHeader = request.headers.get('Authorization');
  const headerAccessToken = authHeader?.replace(/^Bearer\s+/i, '');

  const accessToken = cookieAccessToken ?? headerAccessToken;
  const sessionUser = cookieSessionUser;

  if (!sessionUser || !accessToken) {
    const res = NextResponse.json(
      { user: null, success: false },
      { status: 401 },
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions);
    res.cookies.set(SESSION_COOKIE, '', expiredCookieOptions);
    return res;
  }

  return NextResponse.json({
    user: sessionUser,
    accessToken,
    success: true,
  });
}