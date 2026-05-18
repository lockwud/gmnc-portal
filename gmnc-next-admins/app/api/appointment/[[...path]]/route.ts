import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function buildBackendUrl(pathSegments: string[], search: string) {
  const encodedPath = pathSegments.map(encodeURIComponent).join('/');
  return `${env.API_BASE_URL}/schedule-appointment${encodedPath ? '/' + encodedPath : ''}${search}`;
}

async function proxyAppointmentRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authorization token is required' },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const backendUrl = buildBackendUrl(path ?? [], url.search);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
      },
      body,
      cache: 'no-store',
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error(`[API/APPOINTMENT] Proxy error:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function safeFetchAppointments(token: string) {
  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const safeFetch = async (backendPath: string) => {
    try {
      const res = await fetch(`${env.API_BASE_URL}${backendPath}`, {
        headers: authHeader,
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.appointments || json;
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const results = await Promise.all([
    safeFetch('/schedule-appointment'),
    safeFetch('/schedule-appointment/provider'),
    safeFetch('/schedule-appointment/caregiver'),
    safeFetch('/admin/appointments'),
    safeFetch('/admin/schedule-appointment'),
    safeFetch('/appointments')
  ]);

  return results.find(res => Array.isArray(res)) || [];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // If path is empty (root fetch), fan out to find the right endpoint for the user's role
  if (!path || path.length === 0) {
    const appointments = await safeFetchAppointments(token);
    return NextResponse.json({ success: true, data: appointments });
  }

  return proxyAppointmentRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAppointmentRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAppointmentRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAppointmentRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAppointmentRequest(request, context);
}
