import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

export async function POST(request: NextRequest) {
  const token =
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (!env.API_BASE_URL) {
    return NextResponse.json(
      { success: false, message: 'API base URL not configured' },
      { status: 500 },
    );
  }

  // Parse userId from request body (admin deleting another user)
  let payload: { userId?: string } = {};
  try {
    payload = await request.json();
  } catch {
    // no body
  }

  const backendUrl = `${env.API_BASE_URL}/user/delete-account`;
  const authHeader: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ userId: payload.userId }),
      cache: 'no-store',
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Delete-Account] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('[Delete-Account] Request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
