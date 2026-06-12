export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = (await request.json()) as { userId?: string };
    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const upstream = await fetch(`${env.API_BASE_URL}/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
