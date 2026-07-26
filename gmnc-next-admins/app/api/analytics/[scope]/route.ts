import { NextRequest, NextResponse } from 'next/server';

import { requireApiBaseUrl } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

const ALLOWED_SCOPES = new Set(['admin', 'provider', 'support']);
const ALLOWED_FILTERS = new Set(['today', 'this_week', 'this_month', 'all_time']);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scope: string }> },
) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { scope } = await context.params;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  if (!ALLOWED_SCOPES.has(scope)) {
    return NextResponse.json(
      { success: false, message: 'Unknown analytics scope' },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'this_week';
  const normalizedFilter = ALLOWED_FILTERS.has(filter) ? filter : 'this_week';
  const backendUrl = `${requireApiBaseUrl()}/analytics/${scope}?filter=${encodeURIComponent(normalizedFilter)}`;
  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });
    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    if (!response.ok) {
      console.error(`[Analytics] Backend error: ${response.status}`, responseText.slice(0, 500));
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('[Analytics] Request failed:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch ${scope} analytics` },
      { status: 500 },
    );
  }
}
