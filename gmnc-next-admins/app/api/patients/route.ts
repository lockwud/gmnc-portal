import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../lib/env';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/session';
import fs from 'fs';

export const dynamic = 'force-dynamic';

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

  const safeFetch = async (urlPath: string) => {
    try {
      console.log(`[API/PATIENTS] Fetching: ${urlPath}`);
      const res = await fetch(`${env.API_BASE_URL}${urlPath}`, {
        method: 'GET',
        headers: authHeader,
        cache: 'no-store',
      });
      if (!res.ok) {
        console.warn(`[API/PATIENTS] ${urlPath} -> ${res.status}`);
        const text = await res.text().catch(() => '');
        console.warn(`[API/PATIENTS] ${urlPath} error text:`, text);
        return [];
      }
      const json = await res.json().catch(() => null);
      console.log(`[API/PATIENTS] ${urlPath} success, raw JSON:`, JSON.stringify(json).slice(0, 300));
      return getItems(json);
    } catch (err) {
      console.error(`[API/PATIENTS] Failed to fetch ${urlPath}:`, err);
      return [];
    }
  };

  try {
    const [directPatients, usersAll, adminUsers] = await Promise.all([
      safeFetch('/cp-patient'),
      safeFetch('/users'),
      safeFetch('/admin/users'),
    ]);

    const tagType = (arr: any[], defaultType: string) =>
      arr.map((u: any) => {
        const userObj = u.user || u;
        return { ...userObj, userType: userObj.userType || defaultType };
      });

    const allRaw = [
      ...tagType(directPatients, 'CP_PATIENT'),
      ...tagType(usersAll, 'CP_PATIENT'),
      ...tagType(adminUsers, 'CP_PATIENT'),
    ];

    const seen = new Set<string>();
    const combined = allRaw.filter((u: any) => {
      const id = u.id || u._id || u.slug;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      const type = (u.userType || '').toUpperCase();
      return type === 'CP_PATIENT' || type === 'PATIENT';
    });

    return NextResponse.json({ success: true, data: combined });
  } catch (error: any) {
    console.error('[API/PATIENTS] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reach backend' },
      { status: 502 }
    );
  }
}