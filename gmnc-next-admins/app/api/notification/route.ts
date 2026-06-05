import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function getToken(request: NextRequest) {
  return request.headers.get('Authorization')?.replace('Bearer ', '')
    || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

async function proxyNotificationRequest(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  const response = await fetch(`${env.API_BASE_URL}/notification${url.search}`, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const responseText = await response.text();
  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyNotificationRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyNotificationRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyNotificationRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyNotificationRequest(request);
}
