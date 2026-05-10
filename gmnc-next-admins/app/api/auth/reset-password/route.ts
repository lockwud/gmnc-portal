import { NextRequest, NextResponse } from 'next/server';

import { resetPasswordRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import { resetPasswordSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? 'Invalid input.',
          errors: flat,
        },
        { status: 400 },
      );
    }

    await resetPasswordRequest(parsed.data.token, parsed.data.password);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully.',
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
