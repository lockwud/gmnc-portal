import { NextResponse } from 'next/server'
import { requireApiBaseUrl } from '@/lib/env'

function authHeaders(request: Request): Record<string, string> {
  const authorization = request.headers.get('authorization');
  return authorization ? { Authorization: authorization } : {};
}

export async function POST(request: Request) {
  try {
    const apiBaseUrl = requireApiBaseUrl();
    const body = await request.json()
    const res = await fetch(`${apiBaseUrl}/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(request) },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const apiBaseUrl = requireApiBaseUrl();
    const url = new URL(request.url)
    const seg = url.pathname.split('/')
    const userId = seg[seg.length - 1]
    const res = await fetch(`${apiBaseUrl}/signature/${userId}`, { credentials: 'include', headers: authHeaders(request) })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}
