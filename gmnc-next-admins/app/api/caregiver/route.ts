import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const caregiverUrl = `${env.API_BASE_URL}/caregiver?page=1&limit=200`;
    const response = await fetch(caregiverUrl, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      const errorMsg = (data as Record<string, unknown>)?.message || 'Failed to load caregivers';
      return NextResponse.json(
        { status: false, message: errorMsg },
        { status: response.status }
      );
    }

    const getItems = (obj: unknown): unknown[] => {
      if (Array.isArray(obj)) return obj;
      if (!obj) return [];
      const record = obj as Record<string, unknown>;
      const dataField = record.data || record.items || record.caregivers || record.careGivers || obj;
      if (Array.isArray(dataField)) return dataField;
      if (dataField && dataField !== obj) return getItems(dataField);
      return [];
    };

    const caregivers = getItems(data);
    
    return NextResponse.json({ 
      status: true, 
      data: caregivers
    });
  } catch (error: unknown) {
    const isTimeout = (error as Error).name === 'AbortError' || (error as Error).name === 'TimeoutError';
    console.error('[API/CAREGIVER] Error:', error);
    return NextResponse.json(
      { success: false, message: isTimeout ? 'Backend request timed out' : 'Failed to reach backend' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
