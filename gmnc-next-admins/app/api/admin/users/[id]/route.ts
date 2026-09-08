import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../../lib/session';
import { getErrorMessage } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body.userType;

    // Status-only updates go to the dedicated admin endpoint
    // (PATCH /admin/users/:id/status) — the only generic user mutation
    // the backend exposes.
    const keys = Object.keys(body).filter((key) => key !== 'userType');
    const isStatusOnly = keys.length === 1 && keys[0] === 'status';

    let backendUrl = `${env.API_BASE_URL}/admin/users/${id}`;
    let method = 'PATCH';

    if (isStatusOnly) {
      backendUrl = `${env.API_BASE_URL}/admin/users/${id}/status`;
    } else if (type === 'SERVICE_PROVIDER') {
      backendUrl = `${env.API_BASE_URL}/service-provider/${id}`;
      method = 'PUT';
    } else if (type === 'CAREGIVER') {
      backendUrl = `${env.API_BASE_URL}/caregiver/${id}`;
      method = 'PUT';
    } else if (type === 'CP_PATIENT' || type === 'PATIENT') {
      backendUrl = `${env.API_BASE_URL}/cp-patient/${id}`;
      method = 'PATCH';
    } else {
      // ADMIN/SUPPORT/TESTER rows have no profile-update endpoint: only
      // account status can change (handled above).
      return NextResponse.json(
        { success: false, message: 'Only account status can be changed for this user type. Profile fields are editable for caregivers and providers via their own endpoints.' },
        { status: 400 },
      );
    }

    console.log(`[API/ADMIN/USERS/[ID]] Proxying ${method} to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update user' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let backendUrl = `${env.API_BASE_URL}/admin/users/${id}`;

    if (type === 'SERVICE_PROVIDER') {
      backendUrl = `${env.API_BASE_URL}/service-provider/${id}`;
    } else if (type === 'CAREGIVER') {
      backendUrl = `${env.API_BASE_URL}/caregiver/${id}`;
    } else if (type === 'CP_PATIENT' || type === 'PATIENT') {
      backendUrl = `${env.API_BASE_URL}/cp-patient/${id}`;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete user' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
