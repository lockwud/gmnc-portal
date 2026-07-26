import { NextRequest, NextResponse } from 'next/server';
import { requireApiBaseUrl } from '../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/session';

type ApiRecord = Record<string, unknown>;

function getData(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  const record = obj as ApiRecord;
  return record.data ?? obj;
}

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

function getId(item: ApiRecord) {
  return typeof item.id === 'string' ? item.id : typeof item._id === 'string' ? item._id : null;
}

function getPortalRole(assignments: unknown) {
  const list = Array.isArray(assignments) ? assignments : [];
  for (const assignment of list) {
    if (!assignment || typeof assignment !== 'object') continue;
    const role = (assignment as ApiRecord).role;
    if (!role || typeof role !== 'object') continue;
    const roleRecord = role as ApiRecord;
    const value = String(roleRecord.slug || roleRecord.name || '').toUpperCase();
    if (value === 'ADMIN' || value === 'SUPPORT' || value === 'TESTER') return value;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  try {
    const url = new URL(request.url);
    const response = await fetch(`${requireApiBaseUrl()}/admin/users${url.search}`, {
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

    const users = getItems(data);
    const userIds = users.map(getId).filter((id): id is string => Boolean(id));
    if (userIds.length > 0) {
      const rolesResponse = await fetch(`${requireApiBaseUrl()}/admin/rbac/users/roles?userIds=${encodeURIComponent(userIds.join(','))}`, {
        method: 'GET',
        headers: authHeader,
        cache: 'no-store',
      });
      const rolesPayload = await rolesResponse.json().catch(() => null);
      const roleMap = getData(rolesPayload) as ApiRecord;
      for (const user of users) {
        const id = getId(user);
        if (!id) continue;
        const portalRole = getPortalRole(roleMap?.[id]);
        if (portalRole) user.portalRole = portalRole;
      }
    }

    return NextResponse.json({ success: true, data: users });
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
    const requestedRole = String(body.role || body.userType || 'SERVICE_PROVIDER').toUpperCase();

    if (requestedRole === 'CAREGIVER') {
      return NextResponse.json(
        { success: false, message: 'Caregivers do not use this admin portal.' },
        { status: 400 },
      );
    }

    const backendRole = requestedRole === 'ADMIN' ? 'ADMIN' : 'SERVICE_PROVIDER';
    const rbacRoleSlug = requestedRole === 'SUPPORT' || requestedRole === 'TESTER'
      ? requestedRole
      : null;
    const backendUrl = `${requireApiBaseUrl()}/auth/register`;
    const backendPayload = {
      ...body,
      role: backendRole,
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };

    console.log(`[API/ADMIN/USERS] Proxying creation to: ${backendUrl} (${requestedRole})`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
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

    const createdUserId = data?.data?.id || data?.data?.user?.id || data?.id || data?.user?.id;

    if (rbacRoleSlug && createdUserId) {
      const rolesResponse = await fetch(`${requireApiBaseUrl()}/admin/rbac/roles?lite=true`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const rolesData = await rolesResponse.json().catch(() => null);
      const rolesDataBody = getData(rolesData);
      const roles = Array.isArray(rolesDataBody) ? rolesDataBody : [];
      const role = roles.find((item: Record<string, unknown>) => {
        const value = String(item.slug || item.name || '').toUpperCase();
        return value === rbacRoleSlug;
      });

      if (role?.id) {
        const assignResponse = await fetch(`${requireApiBaseUrl()}/admin/rbac/users/${createdUserId}/roles`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roleId: role.id, scopeType: 'GLOBAL' }),
        });
        if (!assignResponse.ok) {
          const assignError = await assignResponse.json().catch(() => null);
          return NextResponse.json(
            { success: false, message: assignError?.message || `User created, but ${rbacRoleSlug.toLowerCase()} role assignment failed` },
            { status: assignResponse.status },
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: `User created, but ${rbacRoleSlug.toLowerCase()} RBAC role was not found` },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({ success: true, data: { ...data, requestedRole, backendRole } });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
