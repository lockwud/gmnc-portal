import { NextRequest, NextResponse } from 'next/server';

import { forgotPasswordRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import { forgotPasswordSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'A valid email address is required.',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await forgotPasswordRequest(parsed.data.email);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a recovery link has been sent.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: getErrorStatus(error) },
    );
  }
}
