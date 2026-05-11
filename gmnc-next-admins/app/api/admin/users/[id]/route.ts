import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../../lib/session';

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
    
    let backendUrl = `${env.API_BASE_URL}/admin/users/${id}`; // Fallback
    let method = 'PATCH';

    if (type === 'SERVICE_PROVIDER') {
      backendUrl = `${env.API_BASE_URL}/service-provider/${id}`;
      method = 'PUT';
    } else if (type === 'CAREGIVER') {
      backendUrl = `${env.API_BASE_URL}/caregiver/${id}`;
      method = 'PUT';
    } else if (type === 'CP_PATIENT' || type === 'PATIENT') {
      backendUrl = `${env.API_BASE_URL}/cp-patient/${id}`;
      method = 'PATCH';
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
