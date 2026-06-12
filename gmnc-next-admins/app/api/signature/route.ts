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
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const seg = url.pathname.split('/')
    const userId = seg[seg.length - 1]
    const res = await fetch(`${env.API_BASE_URL}/signature/${userId}`, { credentials: 'include' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'proxy error' }, { status: 500 })
  }
}
