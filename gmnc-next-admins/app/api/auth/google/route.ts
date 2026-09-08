import { NextResponse } from 'next/server';

import { googleLoginRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';

/**
 * GET /api/auth/google — starts Google OAuth. Returns the backend auth URL
 * plus the CSRF state and PKCE verifier the browser must hold (sessionStorage)
 * and return on the callback for verification.
 */
export async function GET() {
  try {
    const data = await googleLoginRequest();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
