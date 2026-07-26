import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/session';
import { changePasswordRequest } from '../../../../lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    await changePasswordRequest(payload, token);

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) || 'Failed to change password' },
      { status: getErrorStatus(error) }
    );
  }
}
