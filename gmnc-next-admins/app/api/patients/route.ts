import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const backendUrl = `${env.API_BASE_URL}/cp-patient`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: (typeof data === 'object' && data?.message) || 'Backend error' },
        { status: response.status }
      );
    }

    const patients = data.data || data.patients || (Array.isArray(data) ? data : []);

    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    return NextResponse.json(
      { success: false, message: isTimeout ? 'Backend request timed out' : 'Failed to reach backend' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
