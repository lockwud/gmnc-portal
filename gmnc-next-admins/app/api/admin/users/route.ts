import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  const getItems = (obj: any): any[] => {
    if (Array.isArray(obj)) return obj;
    if (!obj) return [];
    
    // Check top-level or data-level arrays
    const data = obj.data || obj;
    if (Array.isArray(data)) return data;
    
    // Check common nested keys
    const keys = ['users', 'items', 'careGivers', 'serviceProviders', 'patients', 'data'];
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key];
      if (obj.data && Array.isArray(obj.data[key])) return obj.data[key];
    }
    
    return [];
  };

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url, { headers: authHeader, cache: 'no-store' });
      if (!res.ok) {
        console.warn(`[API/ADMIN/USERS] ${url} -> ${res.status}`);

        // If admin endpoint returns 403, try bootstrapping RBAC first then retry
        if (res.status === 403 && url.includes('/admin/users')) {
          console.log('[API/ADMIN/USERS] 403 on admin/users — attempting auto-bootstrap...');
          try {
            const bootstrapRes = await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
              method: 'POST',
              headers: { ...authHeader, 'Content-Type': 'application/json' },
            });
            console.log(`[API/ADMIN/USERS] Bootstrap response: ${bootstrapRes.status}`);
            // Retry the original request after bootstrap
            const retryRes = await fetch(url, { headers: authHeader, cache: 'no-store' });
            if (retryRes.ok) {
              const retryJson = await retryRes.json().catch(() => null);
              console.log(`[API/ADMIN/USERS] Retry ${url} raw data:`, JSON.stringify(retryJson, null, 2));
              return getItems(retryJson);
            }
          } catch (bootstrapErr) {
            console.error('[API/ADMIN/USERS] Auto-bootstrap failed:', bootstrapErr);
          }
        }

        return [];
      }
      const json = await res.json().catch(() => null);
      console.log(`[API/ADMIN/USERS] ${url} raw data:`, JSON.stringify(json, null, 2));
      return getItems(json);
    } catch (e) {
      console.error(`[API/ADMIN/USERS] Failed to fetch ${url}:`, e);
      return [];
    }
  };

  try {
    // Fetch from ALL sources in parallel — admin list + every role-specific endpoint
    const [adminUsers, adminUserSingular, usersAll, providers, caregivers, patients] = await Promise.all([
      safeFetch(`${env.API_BASE_URL}/admin/users`),
      safeFetch(`${env.API_BASE_URL}/admin/user`),
      safeFetch(`${env.API_BASE_URL}/users`),
      safeFetch(`${env.API_BASE_URL}/service-provider`),
      safeFetch(`${env.API_BASE_URL}/caregiver`),
      safeFetch(`${env.API_BASE_URL}/cp-patient`),
    ]);

    // Normalize each source and tag with userType if missing
    const tagType = (arr: any[], type: string) =>
      arr.map((u: any) => {
        const userObj = u.user || u;
        return { ...userObj, userType: userObj.userType || type };
      });

    const allRaw = [
      ...tagType(adminUsers, 'ADMIN'),
      ...tagType(adminUserSingular, 'ADMIN'),
      ...tagType(usersAll, 'ADMIN'),
      ...tagType(providers, 'SERVICE_PROVIDER'),
      ...tagType(caregivers, 'CAREGIVER'),
      ...tagType(patients, 'CP_PATIENT'),
    ];

    // Deduplicate by id — keep the first occurrence
    const seen = new Set<string>();
    const combined = allRaw.filter((u: any) => {
      const id = u.id || u._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    console.log(`[API/ADMIN/USERS] Returning ${combined.length} merged users (admin:${adminUsers.length}, sp:${providers.length}, cg:${caregivers.length}, pt:${patients.length})`);

    return NextResponse.json({ success: true, data: combined });
  } catch (error: any) {
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
    
    // Probed endpoints: 
    // - /auth/register (400 - Exists) 
    // - /cp-patient (401 - Exists)
    // - /auth/signup (404 - Not found)
    let backendUrl = `${env.API_BASE_URL}/auth/register`;
    
    if (targetType === 'CP_PATIENT' || targetType === 'PATIENT') {
      backendUrl = `${env.API_BASE_URL}/cp-patient`;
    } else if (targetType === 'SERVICE_PROVIDER' || targetType === 'CAREGIVER') {
      backendUrl = `${env.API_BASE_URL}/auth/register`;
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
      
      // If /admin/users POST is not supported, try /auth/signup as a last resort for non-patients
      if (response.status === 404 && (targetType === 'SERVICE_PROVIDER' || targetType === 'CAREGIVER')) {
         console.log('[API/ADMIN/USERS] /admin/users 404. Retrying with /auth/signup...');
         const retryRes = await fetch(`${env.API_BASE_URL}/auth/signup`, {
           method: 'POST',
           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
           body: JSON.stringify(body),
         });
         if (retryRes.ok) return NextResponse.json({ success: true, data: await retryRes.json() });
      }

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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
