import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { ACCESS_TOKEN_COOKIE } from '@/lib/session';

function buildBackendUrl(pathSegments: string[], search: string, adminFallback = false) {
  const encodedPath = pathSegments.map(encodeURIComponent).join('/');
  const prefix = adminFallback ? 'admin/assessment' : 'assessment';
  return `${env.API_BASE_URL}/${prefix}/${encodedPath}${search}`;
}

async function fetchWithFallback(
  url: string,
  fallbackUrl: string,
  method: string,
  headers: Record<string, string>,
  body?: string,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    let response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (response.status === 403) {
      console.log(`[API/ASSESSMENT] 403 on ${url} — attempting admin bootstrap and fallback`);
      try {
        const bootstrapRes = await fetch(`${env.API_BASE_URL}/admin/bootstrap`, {
          method: 'POST',
          headers,
        });

        if (bootstrapRes.ok) {
          response = await fetch(url, {
            method,
            headers,
            body,
            cache: 'no-store',
          });
        }
      } catch (bootstrapError) {
        console.error('[API/ASSESSMENT] admin/bootstrap failed:', bootstrapError);
      }
    }

    if (response.status === 403 && fallbackUrl) {
      console.log(`[API/ASSESSMENT] retrying with admin assessment path ${fallbackUrl}`);
      const fallbackResponse = await fetch(fallbackUrl, {
        method,
        headers,
        body,
        cache: 'no-store',
      });
      return fallbackResponse;
    }

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
  const adminBackendUrl = buildBackendUrl(path ?? [], url.search, true);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  };

  const response = await fetchWithFallback(
    backendUrl,
    adminBackendUrl,
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