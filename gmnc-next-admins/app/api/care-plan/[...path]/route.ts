import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = `${env.API_BASE_URL}/care-plan${url.pathname === '/care-plan' ? '' : ''}${url.search}`;

  const authHeader = request.headers.get('authorization');
  const res = await fetch(target, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    credentials: 'include',
  });

  const text = await res.text();
  let payload: unknown = text;
  try { payload = JSON.parse(text); } catch { /* pass through raw text */ }

  return new NextResponse(
    typeof payload === 'string' ? JSON.stringify({ message: payload }) : JSON.stringify(payload),
    { status: res.status, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.text();
  const target = `${env.API_BASE_URL}/care-plan${url.pathname === '/care-plan' ? '' : ''}${url.search}`;

  const authHeader = request.headers.get('authorization');
  const res = await fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body,
    credentials: 'include',
  });

  const text = await res.text();
  let payload: unknown = text;
  try { payload = JSON.parse(text); } catch { /* pass through raw text */ }

  return new NextResponse(
    typeof payload === 'string' ? JSON.stringify({ message: payload }) : JSON.stringify(payload),
    { status: res.status, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const body = await request.text();
  const target = `${env.API_BASE_URL}/care-plan${url.pathname === '/care-plan' ? '' : ''}${url.search}`;

  const authHeader = request.headers.get('authorization');
  const res = await fetch(target, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body,
    credentials: 'include',
  });

  const text = await res.text();
  let payload: unknown = text;
  try { payload = JSON.parse(text); } catch { /* pass through raw text */ }

  return new NextResponse(
    typeof payload === 'string' ? JSON.stringify({ message: payload }) : JSON.stringify(payload),
    { status: res.status, headers: { 'Content-Type': 'application/json' } }
  );
}
