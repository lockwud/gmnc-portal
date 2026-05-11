import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE, serializeSessionUser } from '../../../lib/session';
import { getProfileRequest, updateProfileRequest } from '../../../lib/api/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    console.log('[API/USER] No token found in cookies');
    return NextResponse.json({ success: true, user: null });
  }

  try {
    console.log('[API/USER] Token found, fetching profile...');
    const user = await getProfileRequest(token);
    console.log('[API/USER] Profile fetched successfully for:', user.email, 'Roles:', user.roles);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('[API/USER] Profile Fetch Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch profile' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const user = await updateProfileRequest(payload, token);

    const response = NextResponse.json({ success: true, user });
    
    // Update session cookie with new user data
    response.cookies.set(SESSION_COOKIE, serializeSessionUser(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update profile' },
      { status: error.status || 500 }
    );
  }
}
