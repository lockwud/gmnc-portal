import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  if (!env.API_BASE_URL) {
    return NextResponse.json(
      { success: false, message: 'API base URL not configured' },
      { status: 500 },
    );
  }

  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const backendUrl = `${env.API_BASE_URL}/metrics/compute/system`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: authHeader,
      cache: 'no-store',
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Metrics Compute] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('[Metrics Compute] Request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to trigger system metrics computation' },
      { status: 500 },
    );
  }
}
