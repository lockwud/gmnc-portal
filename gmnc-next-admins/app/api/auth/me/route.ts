import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE, deserializeSessionUser } from '@/lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const sessionUser = deserializeSessionUser(cookieStore.get(SESSION_COOKIE)?.value);

  if (!sessionUser) {
    return NextResponse.json({ user: null, success: false });
  }

  return NextResponse.json({ user: sessionUser, success: true });
}