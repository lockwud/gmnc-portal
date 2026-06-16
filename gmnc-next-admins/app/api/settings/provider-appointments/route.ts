import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

async function proxyProviderAppointmentsRequest(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authorization token is required',
      },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const backendUrl = `${env.API_BASE_URL}/settings/provider-appointments${url.search}`;
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

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
}

export async function GET(request: NextRequest) {
  return proxyProviderAppointmentsRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyProviderAppointmentsRequest(request);
}