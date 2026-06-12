export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = (await request.json()) as { userId?: string };
    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const upstream = await fetch(`${env.API_BASE_URL}/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await upstream.json().catch(() => ({}));
    // Normalize backend response to frontend expected format
    if (upstream.ok) {
      return NextResponse.json({ success: true, data: data.data || {} }, { status: 200 });
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to delete user' },
      { status: upstream.status }
    );
  } catch {
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
