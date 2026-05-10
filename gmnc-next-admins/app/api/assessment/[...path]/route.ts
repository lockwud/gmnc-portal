import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function buildBackendUrl(pathSegments: string[], search: string) {
  const encodedPath = pathSegments.map(encodeURIComponent).join('/');
  return `${env.API_BASE_URL}/assessment/${encodedPath}${search}`;
}

async function proxyAssessmentRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
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
  const backendUrl = buildBackendUrl(path ?? [], url.search);
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