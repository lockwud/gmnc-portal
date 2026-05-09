import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(SESSION_COOKIE);

  return response;
}