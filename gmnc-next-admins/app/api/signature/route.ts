import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${env.API_BASE_URL}/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    const text = await res.text()
    let payload: unknown = text
    try { payload = JSON.parse(text) } catch { /* pass through raw text */ }
    return new NextResponse(
      typeof payload === 'string' ? JSON.stringify({ message: payload }) : JSON.stringify(payload),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.pathname.split('/').pop() ?? ''
    const res = await fetch(`${env.API_BASE_URL}/signature/${userId}`, { credentials: 'include' })
    const text = await res.text()
    let payload: unknown = text
    try { payload = JSON.parse(text) } catch { /* pass through raw text */ }
    return new NextResponse(
      typeof payload === 'string' ? JSON.stringify({ message: payload }) : JSON.stringify(payload),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}
