import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/session';

type ApiRecord = Record<string, unknown>;

function getItems(obj: unknown): ApiRecord[] {
  if (Array.isArray(obj)) return obj.filter((item): item is ApiRecord => typeof item === 'object' && item !== null);
  if (!obj || typeof obj !== 'object') return [];

  const record = obj as ApiRecord;
  const data = record.data;
  if (Array.isArray(data)) return data.filter((item): item is ApiRecord => typeof item === 'object' && item !== null);
  if (data && typeof data === 'object') return getItems(data);

  for (const key of ['users', 'items']) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter((item): item is ApiRecord => typeof item === 'object' && item !== null);
  }

  return [];
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  try {
    const response = await fetch(`${requireApiBaseUrl()}/admin/users`, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Failed to load users' },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data: getItems(data) });
  } catch (error: unknown) {
    console.error('[API/ADMIN/USERS] Proxy Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const targetType = body.role || body.userType || 'SERVICE_PROVIDER';
    
    let backendUrl = `${requireApiBaseUrl()}/auth/register`;
    
    if (targetType === 'CP_PATIENT' || targetType === 'PATIENT') {
      backendUrl = `${requireApiBaseUrl()}/cp-patient`;
    } else if (targetType === 'SERVICE_PROVIDER' || targetType === 'CAREGIVER') {
      backendUrl = `${requireApiBaseUrl()}/auth/register`;
    }

    console.log(`[API/ADMIN/USERS] Proxying creation to: ${backendUrl} (${targetType})`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    if (!response.ok && !contentType?.includes('application/json')) {
      const errorText = await response.text();
      console.error(`[API/ADMIN/USERS] Backend error (${response.status}):`, errorText.slice(0, 200));
      
      return NextResponse.json(
        { success: false, message: `Backend service error (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API/ADMIN/USERS] User creation backend response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`[API/ADMIN/USERS] Backend error (${response.status}):`, JSON.stringify(data, null, 2));
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Failed to create user',
          errors: data.errors || null
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
