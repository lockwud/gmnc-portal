import { NextRequest, NextResponse } from 'next/server';
import { hasRole, type User } from '@/lib/rbac';
import { sessionUserSchema, type SessionUser } from '@/lib/validators/auth';
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE, deserializeSessionUser } from '@/lib/session';
import { env } from '@/lib/env';

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let caller: SessionUser;
  try {
    caller = sessionUserSchema.parse(deserializeSessionUser(request.cookies.get(SESSION_COOKIE)?.value));
  } catch {
    caller = { id: '', email: null, name: '', roles: [], permissions: [], avatar: null };
  }

  const callerAsUser: User = {
    id: caller.id,
    name: caller.name,
    fullName: caller.name,
    email: typeof caller.email === 'string' ? caller.email : '',
    userType: caller.userType,
    roles: caller.roles,
    permissions: caller.permissions,
    avatar: caller.avatar,
  };

  if (!hasRole(callerAsUser, 'admin') && !hasRole(callerAsUser, 'support')) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : null;
    const userType = typeof body.userType === 'string' ? body.userType.toUpperCase() : null;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    if (userType !== 'SERVICE_PROVIDER' && userType !== 'CAREGIVER') {
      return NextResponse.json(
        { success: false, message: 'Only service providers or caregivers can be deleted via this endpoint' },
        { status: 400 }
      );
    }

    let backendUrl: string;
    if (userType === 'SERVICE_PROVIDER') {
      backendUrl = `${env.API_BASE_URL}/service-provider/${encodeURIComponent(userId)}`;
    } else {
      backendUrl = `${env.API_BASE_URL}/caregiver/${encodeURIComponent(userId)}`;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Retain-Patient-Records': 'true',
      },
      body: JSON.stringify({ retainPatientRecords: true }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: (data as { message?: string }).message || 'Failed to delete account' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: (data as { message?: string }).message || 'Account deleted successfully' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
