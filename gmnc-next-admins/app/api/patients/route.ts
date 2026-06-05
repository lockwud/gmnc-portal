import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/session';

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

  const getItems = (obj: unknown): unknown[] => {
    if (Array.isArray(obj)) return obj;
    if (!obj) return [];
    const data = (obj as Record<string, unknown>).data || obj;
    if (Array.isArray(data)) return data;
    const keys = ['users', 'items', 'patients', 'data'];
    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }
    return [];
  };

  try {
    const cpPatientUrl = `${env.API_BASE_URL}/cp-patient?page=1&limit=200`;
    const cpResponse = await fetch(cpPatientUrl, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });

    if (cpResponse.ok) {
      const data = await cpResponse.json().catch(() => null);
      const patients = getItems(data);
      if (Array.isArray(patients) && patients.length > 0) {
        return NextResponse.json({ status: true, data: patients });
      }
    }

    const adminUrl = `${env.API_BASE_URL}/admin/patients?limit=200`;
    const adminResponse = await fetch(adminUrl, {
      method: 'GET',
      headers: authHeader,
      cache: 'no-store',
    });

    if (adminResponse.ok) {
      const data = await adminResponse.json().catch(() => null);
      const patients = getItems(data);
      return NextResponse.json({ status: true, data: patients });
    }

    const cpErrData = await cpResponse.json().catch(() => null);
    const cpErrMsg = (cpErrData as Record<string, unknown>)?.message || 'No patients found';
    return NextResponse.json(
      { status: false, message: cpErrMsg },
      { status: cpResponse.status }
    );
  } catch (error: unknown) {
    const isTimeout = (error as Error).name === 'AbortError' || (error as Error).name === 'TimeoutError';
    console.error('[API/PATIENTS] Error:', error);
    return NextResponse.json(
      { success: false, message: isTimeout ? 'Backend request timed out' : 'Failed to reach backend' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
