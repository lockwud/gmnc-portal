import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
  deserializeSessionUser,
} from '@/lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const sessionUser = deserializeSessionUser(cookieStore.get(SESSION_COOKIE)?.value);

  if (!sessionUser || !accessToken) {
    const response = NextResponse.json({ user: null, success: false });
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.json({ user: sessionUser, success: true });
}