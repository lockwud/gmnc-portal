import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/session';
import { changePasswordRequest } from '../../../../lib/api/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    await changePasswordRequest(payload, token);

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to change password' },
      { status: error.status || 500 }
    );
  }
}
