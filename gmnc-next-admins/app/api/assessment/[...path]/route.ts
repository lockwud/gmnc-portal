import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function buildBackendUrl(pathSegments: string[], search: string) {
  const encodedPath = pathSegments.map(encodeURIComponent).join('/');
  return `${env.API_BASE_URL}/assessment/${encodedPath}${search}`;
}

async function fetchBackend(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function proxyAssessmentRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const token = authHeader?.replace(/^Bearer\s+/i, '') || cookieToken;

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
  const backendUrl = buildBackendUrl(path ?? [], url.search);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  console.log(`[API/ASSESSMENT] path: ${path?.join('/')}, backend: ${backendUrl}`);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  };

  const response = await fetchBackend(
    backendUrl,
    request.method,
    headers,
    body,
  );

  const responseText = await response.text();
  const contentType = response.headers.get('content-type') ?? 'application/json';

  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAssessmentRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAssessmentRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAssessmentRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAssessmentRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAssessmentRequest(request, context);
}
