import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const getItems = (obj: any): any[] => {
    if (Array.isArray(obj)) return obj;
    if (!obj) return [];
    const data = obj.data || obj;
    if (Array.isArray(data)) return data;
    const keys = ['users', 'items', 'patients', 'data'];
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key];
    }
    return [];
  };

  const fetchWithRetry = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      let response = await fetch(url, {
        method: 'GET',
        headers: authHeader,
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      // If we get a 403 Forbidden, try to bootstrap RBAC and retry once
      if (response.status === 403) {
        console.log(`[API/PATIENTS] 403 on ${url} — attempting auto-bootstrap...`);
        try {
          const bootstrapRes = await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
            method: 'POST',
            headers: authHeader,
          });
          
          if (bootstrapRes.ok) {
            response = await fetch(url, {
              method: 'GET',
              headers: authHeader,
              cache: 'no-store',
            });
          }
        } catch (bootstrapErr) {
          console.error('[API/PATIENTS] Auto-bootstrap failed:', bootstrapErr);
        }
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    const backendUrl = `${env.API_BASE_URL}/cp-patient`;
    let response = await fetchWithRetry(backendUrl);

    // If direct /cp-patient still fails with 403 for an admin, try fallback to admin patients list
    if (response.status === 403) {
      console.log('[API/PATIENTS] /cp-patient forbidden. Trying fallback to /admin/patients...');
      const adminPatientsRes = await fetch(`${env.API_BASE_URL}/admin/patients`, { headers: authHeader, cache: 'no-store' });

      if (adminPatientsRes.ok) {
        const adminData = await adminPatientsRes.json().catch(() => null);
        const fallbackPatients = getItems(adminData);
        console.log(`[API/PATIENTS] Fallback successful. Found ${fallbackPatients.length} patients from admin list.`);
        return NextResponse.json({ success: true, data: fallbackPatients });
      }
    }

    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const message = (typeof data === 'object' && (data?.message || data?.error)) || 
                      (typeof data === 'string' && data) || 
                      'Backend error';
      return NextResponse.json({ success: false, message }, { status: response.status });
    }

    const patients = data.data || data.patients || (Array.isArray(data) ? data : []);
    
    if (patients.length === 0) {
      console.log('[API/PATIENTS] /cp-patient returned empty data. Trying fallback to /admin/patients...');
      const adminPatientsRes = await fetch(`${env.API_BASE_URL}/admin/patients`, { headers: authHeader, cache: 'no-store' });

      if (adminPatientsRes.ok) {
        const adminData = await adminPatientsRes.json().catch(() => null);
        const fallbackPatients = getItems(adminData);
        console.log(`[API/PATIENTS] Fallback successful. Found ${fallbackPatients.length} patients from admin list.`);
        return NextResponse.json({ success: true, data: fallbackPatients });
      }
    }

    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError' || error.name === 'TimeoutError';
    console.error('[API/PATIENTS] Error:', error);
    return NextResponse.json(
      { success: false, message: isTimeout ? 'Backend request timed out' : 'Failed to reach backend' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
