import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/session';

type PatientRecord = Record<string, unknown> & {
  caregiver?: {
    user?: { fullName?: string; name?: string };
    fullName?: string;
    name?: string;
  };
  latestAssessmentStatus?: unknown;
  nextAppointmentDate?: unknown;
  latestReferralStatus?: unknown;
  openTasksCount?: unknown;
};

function getTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function tokenHasAdminRole(token: string) {
  const payload = getTokenPayload(token);
  const roles = Array.isArray(payload?.roles) ? payload.roles : [];
  const normalizedRoles = roles.map((role) => {
    if (typeof role === 'string') return role.toLowerCase();
    if (role && typeof role === 'object') {
      const record = role as Record<string, unknown>;
      return String(record.slug ?? record.name ?? '').toLowerCase();
    }
    return '';
  });

  return payload?.userType === 'ADMIN'
    || normalizedRoles.includes('admin')
    || normalizedRoles.includes('super_admin');
}

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
    const keys = ['users', 'items', 'patients', 'data'];
    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
      if (record[key] && typeof record[key] === 'object') {
        const nested = getItems(record[key]);
        if (nested.length > 0) return nested;
      }
    }
    return [];
  };

  const mapPatients = (patients: unknown[]) => patients.map((patient) => {
    const p = patient as PatientRecord;
    const caregiverName =
      p.caregiver?.user?.fullName ||
      p.caregiver?.user?.name ||
      p.caregiver?.fullName ||
      p.caregiver?.name ||
      '—';

    return {
      ...p,
      caregiver: {
        fullName: caregiverName,
        name: caregiverName,
      },
      latestAssessmentStatus: p.latestAssessmentStatus || null,
      nextAppointmentDate: p.nextAppointmentDate || null,
      latestReferralStatus: p.latestReferralStatus || null,
      openTasksCount: typeof p.openTasksCount === 'number' ? p.openTasksCount : 0,
    };
  });

  const fetchBackend = (path: string) => fetch(`${requireApiBaseUrl()}${path}`, {
    method: 'GET',
    headers: authHeader,
    cache: 'no-store',
  });

  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    if (!searchParams.has('page')) searchParams.set('page', '1');
    if (!searchParams.has('limit')) searchParams.set('limit', '200');

    const backendPath = tokenHasAdminRole(token) ? '/admin/patients' : '/cp-patient';
    const response = await fetchBackend(`${backendPath}?${searchParams.toString()}`);
    const data = await response.json().catch(() => null);

    if (response.ok) {
      const patients = getItems(data);
      return NextResponse.json({ status: true, data: mapPatients(patients) });
    }

    return NextResponse.json(
      { status: false, message: (data as Record<string, unknown>)?.message || 'Failed to load patients' },
      { status: response.status }
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
