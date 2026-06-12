import { NextRequest, NextResponse } from 'next/server';
import { loginRequest } from '@/lib/api/auth';
import { loginSchema } from '@/lib/validators/auth';

type AnyObject = Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : null;
    const password = typeof body.password === 'string' ? body.password : null;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Identifier and password are required' },
        { status: 400 }
      );
    }

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const loginResult = await loginRequest(parsed.data);

    const rawUser = ((): AnyObject => {
      const raw = loginResult.raw as AnyObject;
      const rootUser = raw.user instanceof Object ? (raw.user as AnyObject) : null;
      const nestedUser = typeof raw.data === 'object' && raw.data !== null
        ? ((raw.data as AnyObject).user instanceof Object
          ? ((raw.data as AnyObject).user as AnyObject)
          : null)
        : null;
      return rootUser ?? nestedUser ?? (raw instanceof Object ? raw : {});
    })();

    const rawUserId =
      typeof rawUser.id === 'string'
        ? rawUser.id
        : typeof rawUser.userId === 'string'
          ? rawUser.userId
          : undefined;

    const isDeleted =
      rawUser.deleted === true
      || rawUser.isDeleted === true
      || rawUser.accountStatus === 'DELETED'
      || rawUser.status === 'DELETED';

    const recoveryFlag =
      rawUser.previouslyDeleted === true
      || rawUser.isReelegible === true
      || rawUser.recoveryEligible === true
      || (rawUser.metadata instanceof Object && ((rawUser.metadata as AnyObject).previouslyDeleted === true));

    if (!isDeleted && !recoveryFlag) {
      return NextResponse.json(
        { success: false, message: 'No deleted account found for these credentials. Please use the normal login.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      login: loginResult,
      accountSuspended: true,
      recoveryEligible: true,
      previousAccountId: rawUserId,
      message: 'Deleted account detected. Use this session to proceed with account recovery.',
    });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status: number }).status
      : 500;

    if (status === 401) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or account not found' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
