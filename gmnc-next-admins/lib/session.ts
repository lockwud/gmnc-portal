import { env } from '@/lib/env';
import { sessionUserSchema, type SessionUser } from '@/lib/validators/auth';

export const ACCESS_TOKEN_COOKIE = 'gmnc_access_token';
export const SESSION_COOKIE = 'gmnc_session';
export const SESSION_MAX_AGE = 60 * 60 * 8;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

export function serializeSessionUser(user: SessionUser) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}

export function deserializeSessionUser(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    return sessionUserSchema.parse(JSON.parse(decoded));
  } catch {
    return null;
  }
}