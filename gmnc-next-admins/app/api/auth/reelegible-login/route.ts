import { NextRequest, NextResponse } from 'next/server';
import { loginRequest } from '@/lib/api/auth';
import { loginSchema } from '@/lib/validators/auth';
import type { LoginInput } from '@/lib/validators/auth';

type AnyObject = Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

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

    const payload = parsed.data as LoginInput;

    try {
      const loginResult = await loginRequest(payload);

      const raw = loginResult.raw as AnyObject;
      const rootUser = raw.user instanceof Object ? (raw.user as AnyObject) : null;
      const nestedUser = typeof raw.data === 'object' && raw.data !== null
        ? ((raw.data as AnyObject).user instanceof Object
          ? ((raw.data as AnyObject).user as AnyObject)
          : null)
        : null;
      const rawUser = rootUser ?? nestedUser ?? (raw instanceof Object ? raw : {});

      const rawUserId =
        typeof rawUser.userId === 'string'
          ? rawUser.userId
          : typeof rawUser.id === 'string'
            ? rawUser.id
            : undefined;

      const isDeleted =
        rawUser.deleted === true
        || rawUser.isDeleted === true
        || rawUser.accountStatus === 'DELETED'
        || rawUser.status === 'DELETED';

      const hasExistingMarker = !!(
        rawUserId
        && (
          rawUser.previouslyDeleted === true
          || rawUser.isReelegible === true
          || rawUser.recoveryEligible === true
          || (rawUser.metadata instanceof Object && ((rawUser.metadata as AnyObject).previouslyDeleted === true))
        )
      );

      if (isDeleted || hasExistingMarker) {
        const duplicated = {
          ...loginResult,
          user: {
            ...loginResult.user,
            accountSuspended: true,
            previousAccountId: rawUserId,
            recoveryEligible: true,
          },
        };

        return NextResponse.json({
          success: true,
          login: duplicated,
          accountSuspended: true,
          recoveryEligible: true,
          previousAccountId: rawUserId,
          message: 'Previously deleted account detected. Please proceed to recover your account.',
        });
      }

      return NextResponse.json({
        success: true,
        login: loginResult,
        accountSuspended: false,
        recoveryEligible: false,
      });
    } catch (authError: unknown) {
      const status = typeof authError === 'object' && authError !== null && 'status' in authError
        ? (authError as { status: number }).status
        : 401;

      if (status === 401) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials or account not found' },
          { status: 401 }
        );
      }

      throw authError;
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
