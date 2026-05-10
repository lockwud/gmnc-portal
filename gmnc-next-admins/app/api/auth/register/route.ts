import { NextRequest, NextResponse } from 'next/server';

import { registerRequest } from '@/lib/api/auth';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import { registerSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
            user: data.user,
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
