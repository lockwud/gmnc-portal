import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

async function fetchWithBootstrap(url: string, authHeader: Record<string, string>) {
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeader,
    cache: 'no-store',
  });

  if (response.status === 403) {
    await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
      method: 'POST',
      headers: authHeader,
    });

    return fetch(url, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
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
    const backendUrl = `${env.API_BASE_URL}/metrics/system`;
    const response = await fetchWithBootstrap(backendUrl, authHeader);
    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Metrics] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('[Metrics] Request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch system metrics' },
      { status: 500 },
    );
  }
}
