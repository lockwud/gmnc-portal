import { NextRequest, NextResponse } from 'next/server';

import { registerRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import { registerSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = await registerRequest(parsed.data);

    return NextResponse.json({
      success: true,
      message: data.message || 'Registration successful. Please verify your account.',
      otpChannel: data.otpChannel,
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
