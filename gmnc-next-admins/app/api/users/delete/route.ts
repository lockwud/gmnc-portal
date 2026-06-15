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

    // Step 1: Always delete the user account first (soft delete via admin endpoint)
    // This handles users who may not have completed their profile yet
    const adminUserDeleteUrl = `${env.API_BASE_URL}/admin/users/${encodeURIComponent(userId)}`;
    const adminDeleteResponse = await fetch(adminUserDeleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Even if admin delete fails 404 (user not found), continue to try profile deletion
    const adminDeleteData = await adminDeleteResponse.json().catch(() => ({}));
    if (!adminDeleteResponse.ok && adminDeleteResponse.status !== 404) {
      return NextResponse.json(
        { success: false, message: (adminDeleteData as { message?: string }).message || 'Failed to delete user account' },
        { status: adminDeleteResponse.status }
      );
    }

    // Step 2: Attempt to delete the associated profile (service provider or caregiver)
    // Gracefully handle 404 - the user may not have a profile record yet
    let profileBackendUrl: string;
    if (userType === 'SERVICE_PROVIDER') {
      profileBackendUrl = `${env.API_BASE_URL}/service-provider/${encodeURIComponent(userId)}`;
    } else {
      profileBackendUrl = `${env.API_BASE_URL}/caregiver/${encodeURIComponent(userId)}`;
    }

    const profileResponse = await fetch(profileBackendUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Retain-Patient-Records': 'true',
      },
      body: JSON.stringify({ retainPatientRecords: true }),
    });

    // If profile delete fails with 404 (no profile exists), that's acceptable
    if (!profileResponse.ok && profileResponse.status !== 404) {
      const profileData = await profileResponse.json().catch(() => ({}));
      // Non-404 errors on the profile deletion are non-fatal - user account is already deleted
      console.warn('Profile deletion warning (non-fatal):', (profileData as { message?: string }).message);
    }

    return NextResponse.json({ success: true, message: 'User account deleted successfully. Patient records are retained.' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
