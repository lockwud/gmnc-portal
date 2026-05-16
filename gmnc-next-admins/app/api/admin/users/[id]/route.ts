 import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../../lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const backendUrl = `${env.API_BASE_URL}/admin/users/${id}`;

    console.log(`[API/ADMIN/USERS/[ID]] Updating user ${id} via: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, id, userId: id }),
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn(`[API/ADMIN/USERS/[ID]] Non-JSON response (${response.status}):`, text.slice(0, 100));
      if (response.ok) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false, message: `Server error (${response.status})` }, { status: response.status });
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update user' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`[API/ADMIN/USERS/[ID]] PATCH Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backendUrl = `${env.API_BASE_URL}/admin/users/${id}`;

    console.log(`[API/ADMIN/USERS/[ID]] Deleting user ${id} via: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }

    const contentType = response.headers.get('content-type');
    let message = 'Failed to delete user';
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      message = data.message || message;
    }

    return NextResponse.json({ success: false, message }, { status: response.status });
  } catch (error: any) {
    console.error(`[API/ADMIN/USERS/[ID]] DELETE Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}







