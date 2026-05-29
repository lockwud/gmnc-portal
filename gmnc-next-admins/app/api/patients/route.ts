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

  const fetchWithBootstrap = async (url: string) => {
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

      if (response.status === 403) {
        console.log(`[API/PATIENTS] 403 on ${url} — attempting auto-bootstrap...`);
        try {
          const bootstrapRes = await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
            method: 'POST',
            headers: authHeader,
          });
          console.log(`[API/PATIENTS] Bootstrap response: ${bootstrapRes.status}`);
          
          if (bootstrapRes.ok) {
            response = await fetch(url, {
              method: 'GET',
              headers: authHeader,
              cache: 'no-store',
            });
            console.log(`[API/PATIENTS] Retry ${url} after bootstrap: ${response.status}`);
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
     const response = await fetchWithBootstrap(backendUrl);

     const contentType = response.headers.get('content-type');
     let data: unknown;
     
     if (contentType?.includes('application/json')) {
       data = await response.json();
     } else {
       data = await response.text();
     }
     
     if (!response.ok) {
       const message = (typeof data === 'object' && data !== null && ('message' in data || 'error' in data)) || 
                       (typeof data === 'string' && data) || 
                       'Backend error';
       return NextResponse.json({ status: false, message }, { status: response.status });
     }

     const patients = (data as Record<string, unknown>).data || (data as Record<string, unknown>).patients || (Array.isArray(data) ? data : []);
     
     return NextResponse.json({ status: true, data: patients });
   } catch (error: unknown) {
    const isTimeout = (error as Error).name === 'AbortError' || (error as Error).name === 'TimeoutError';
    console.error('[API/PATIENTS] Error:', error);
    return NextResponse.json(
      { success: false, message: isTimeout ? 'Backend request timed out' : 'Failed to reach backend' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}