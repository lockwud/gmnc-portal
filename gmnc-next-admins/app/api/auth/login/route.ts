import { NextRequest, NextResponse } from 'next/server';

import { loginRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import {
  ACCESS_TOKEN_COOKIE,
  SESSION_COOKIE,
  serializeSessionUser,
  sessionCookieOptions,
} from '@/lib/session';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = await loginRequest(parsed.data);

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, sessionCookieOptions);
    response.cookies.set(SESSION_COOKIE, serializeSessionUser(data.user), sessionCookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: getErrorStatus(error) },
    );
  }
}