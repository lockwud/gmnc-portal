import { NextResponse } from 'next/server';
import { requireApiBaseUrl } from '@/lib/env';

function buildTarget(request: Request, path?: string[]) {
  const url = new URL(request.url);
  const encodedPath = path?.length ? `/${path.map(encodeURIComponent).join('/')}` : '';
  return `${requireApiBaseUrl()}/care-plan${encodedPath}${url.search}`;
}

async function proxyCarePlanRequest(
  request: Request,
  method: 'GET' | 'POST' | 'PATCH',
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const body = method === 'GET' ? undefined : await request.text();
  const authHeader = request.headers.get('authorization');

  const res = await fetch(buildTarget(request, path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body,
    credentials: 'include',
    cache: 'no-store',
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? 'application/json';

  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyCarePlanRequest(request, 'GET', context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyCarePlanRequest(request, 'POST', context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyCarePlanRequest(request, 'PATCH', context);
}
