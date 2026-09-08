import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

/**
 * Pass-through proxy for the functional-classification API (mounted at
 * /functional-classification in the backend). Forwards method, query string,
 * and JSON body with the portal session token.
 */
async function proxyFcRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const token = authHeader?.replace(/^Bearer\s+/i, '') || cookieToken;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authorization token is required' },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const backendUrl = `${env.API_BASE_URL}/functional-classification/${(path ?? []).map(encodeURIComponent).join('/')}${url.search}`;
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const responseText = await backendResponse.text();
  return new NextResponse(responseText, {
    status: backendResponse.status,
    headers: { 'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyFcRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyFcRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyFcRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyFcRequest(request, context);
}
