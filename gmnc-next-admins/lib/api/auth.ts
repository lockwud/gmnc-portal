import type { Role } from '@/lib/rbac';
import { ApiError, apiClient } from '@/lib/api/client';
import type {
  BackendLoginResponse,
  BackendRegisterResponse,
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
} from '@/lib/api/types';
import { sessionUserSchema } from '@/lib/validators/auth';

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case 'admin':
    case 'super_admin':
    case 'superadmin':
      return 'admin';
    case 'provider':
    case 'support':
    case 'tester':
    case 'caregiver':
      return normalized;
    case 'service_provider':
    case 'serviceprovider':
      return 'provider';
    case 'super tester':
    case 'super_tester':
    case 'super-tester':
    case 'supertester':
      return 'admin';
    default:
      return null;
  }
}

function collectRoleValues(rawUser: Record<string, unknown>) {
  const directRoles = Array.isArray(rawUser.roles) ? rawUser.roles : [];

  const nestedUserRoles = Array.isArray(rawUser.userRoles)
    ? rawUser.userRoles.flatMap((userRole) => {
      if (typeof userRole !== 'object' || userRole === null) {
        return [];
      }

      const roleRecord = (userRole as Record<string, unknown>).role;

      if (typeof roleRecord === 'object' && roleRecord !== null) {
        const slug = (roleRecord as Record<string, unknown>).slug;
        const name = (roleRecord as Record<string, unknown>).name;
        return [slug, name];
      }

      return [];
    })
    : [];

  return [...directRoles, ...nestedUserRoles];
}

function collectPermissionValues(rawUser: Record<string, unknown>) {
  const directPermissions = Array.isArray(rawUser.permissions)
    ? rawUser.permissions.filter((permission): permission is string => typeof permission === 'string')
    : [];

  const nestedRolePermissions = Array.isArray(rawUser.userRoles)
    ? rawUser.userRoles.flatMap((userRole) => {
      if (typeof userRole !== 'object' || userRole === null) {
        return [];
      }

      const roleRecord = (userRole as Record<string, unknown>).role;
      if (typeof roleRecord !== 'object' || roleRecord === null) {
        return [];
      }

      const rolePermissions = (roleRecord as Record<string, unknown>).rolePermissions;
      if (!Array.isArray(rolePermissions)) {
        return [];
      }

      return rolePermissions.flatMap((rolePermission) => {
        if (typeof rolePermission !== 'object' || rolePermission === null) {
          return [];
        }

        const permissionRecord = (rolePermission as Record<string, unknown>).permission;
        if (typeof permissionRecord !== 'object' || permissionRecord === null) {
          return [];
        }

        const code = (permissionRecord as Record<string, unknown>).code;
        return typeof code === 'string' ? [code] : [];
      });
    })
    : [];

  return [...new Set([...directPermissions, ...nestedRolePermissions])];
}

function getTokenFromPayload(payload: BackendLoginResponse, headers: Headers) {
  const headerToken = headers.get('x-auth-token')
    ?? headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (headerToken) {
    return headerToken;
  }

  const directToken = payload.accessToken
    ?? payload.access_token
    ?? payload.token
    ?? (typeof payload.data === 'object' && payload.data !== null
      ? (payload.data as Record<string, unknown>).accessToken
      ?? (payload.data as Record<string, unknown>).access_token
      ?? (payload.data as Record<string, unknown>).token
      : undefined);

  return typeof directToken === 'string' && directToken.length > 0 ? directToken : null;
}

// Backend returns session fields at top level or inside `data` (login,
// verify-otp, refresh all share this envelope). Reads either shape.
function getSessionField<T>(payload: BackendLoginResponse, key: string): T | undefined {
  const top = payload[key] as T | undefined;
  if (top !== undefined) return top;
  if (typeof payload.data === 'object' && payload.data !== null) {
    return (payload.data as Record<string, unknown>)[key] as T | undefined;
  }
  return undefined;
}

function getTermsFromPayload(payload: BackendLoginResponse) {
  const terms = getSessionField<Record<string, unknown>>(payload, 'terms');
  if (typeof terms !== 'object' || terms === null) return null;
  return {
    reacceptanceRequired: terms.reacceptanceRequired === true,
    acceptedTermsVersion: typeof terms.acceptedTermsVersion === 'string' ? terms.acceptedTermsVersion : null,
    acceptedPrivacyPolicyVersion: typeof terms.acceptedPrivacyPolicyVersion === 'string' ? terms.acceptedPrivacyPolicyVersion : null,
    liveTermsVersion: typeof terms.liveTermsVersion === 'string' ? terms.liveTermsVersion : undefined,
    livePrivacyPolicyVersion: typeof terms.livePrivacyPolicyVersion === 'string' ? terms.livePrivacyPolicyVersion : undefined,
  };
}

function getRawUser(payload: BackendLoginResponse) {
  if (typeof payload.user === 'object' && payload.user !== null) {
    return payload.user as Record<string, unknown>;
  }

  if (typeof payload.data === 'object' && payload.data !== null) {
    const nestedUser = (payload.data as Record<string, unknown>).user;
    if (typeof nestedUser === 'object' && nestedUser !== null) {
      return nestedUser as Record<string, unknown>;
    }
  }

  return payload as unknown as Record<string, unknown>;
}

function getTokenUserType(accessToken?: string | null) {
  if (!accessToken) return undefined;

  try {
    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) return undefined;

    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Record<string, unknown>;
    return typeof payload.userType === 'string' ? payload.userType : undefined;
  } catch {
    return undefined;
  }
}

function normalizeUser(payload: BackendLoginResponse, accessToken?: string | null) {
  const rawUser = getRawUser(payload);
  const rawRoles = collectRoleValues(rawUser);
  const email = typeof rawUser.email === 'string' ? rawUser.email : null;
  const userType = typeof rawUser.userType === 'string'
    ? rawUser.userType
    : getTokenUserType(accessToken);

  const normalizedRoles = [
    ...new Set(
      rawRoles
        .map((r) => normalizeRole(r))
        .filter((r): r is Role => r !== null)
    )
  ];

  return sessionUserSchema.parse({
    id: typeof rawUser.id === 'string' ? rawUser.id : '',
    email: email,
    name:
      typeof rawUser.fullName === 'string'
        ? rawUser.fullName
        : typeof rawUser.name === 'string'
          ? rawUser.name
          : 'User',
    roles: normalizedRoles,
    permissions: collectPermissionValues(rawUser),
    userType,
    avatar:
      typeof rawUser.avatar === 'string'
        ? rawUser.avatar
        : typeof rawUser.profileImage === 'string'
          ? rawUser.profileImage
          : null,
    terms:
      typeof rawUser.terms === 'object' && rawUser.terms !== null
        ? (rawUser.terms as Record<string, unknown>)
        : undefined,
  });
}

function getRefreshToken(payload: BackendLoginResponse): string | null {
  const value = getSessionField<unknown>(payload, 'refreshToken');
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getUserId(payload: BackendLoginResponse, user: { id: string }): string {
  const value = getSessionField<unknown>(payload, 'userId');
  return typeof value === 'string' && value.length > 0 ? value : user.id;
}

export async function loginRequest(payload: LoginRequest): Promise<LoginResult> {
  const response = await apiClient<BackendLoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  const accessToken = getTokenFromPayload(response.data, response.headers);

  if (!accessToken) {
    throw new ApiError('Login response did not include an access token', 502, response.data);
  }

  const user = normalizeUser(response.data, accessToken);

  return {
    accessToken,
    refreshToken: getRefreshToken(response.data),
    userId: getUserId(response.data, user),
    accessTokenExpiresIn: getSessionField<string>(response.data, 'accessTokenExpiresIn') ?? null,
    refreshTokenExpiresInDays: getSessionField<number>(response.data, 'refreshTokenExpiresInDays') ?? null,
    terms: getTermsFromPayload(response.data),
    user: {
      ...user,
      terms: getTermsFromPayload(response.data) ?? user.terms ?? null,
    },
    raw: response.data,
  };
}

// Rotates the backend session without asking for credentials again.
// Called by /api/auth/refresh when the 7-day access token expires; the
// 30-day refresh token keeps rural/provider sessions alive between visits.
export async function refreshTokenRequest(refreshToken: string, userId: string): Promise<LoginResult> {
  const response = await apiClient<BackendLoginResponse>('/auth/refresh-token', {
    method: 'POST',
    body: { refreshToken, userId },
  });

  const accessToken = getTokenFromPayload(response.data, response.headers);

  if (!accessToken) {
    throw new ApiError('Refresh response did not include an access token', 502, response.data);
  }

  const nextRefreshToken = getRefreshToken(response.data) ?? refreshToken;
  const provisionalUser = normalizeUser(response.data, accessToken);
  const user = {
    ...provisionalUser,
    id: provisionalUser.id || userId,
  };

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    userId: getUserId(response.data, user),
    accessTokenExpiresIn: getSessionField<string>(response.data, 'accessTokenExpiresIn') ?? null,
    refreshTokenExpiresInDays: getSessionField<number>(response.data, 'refreshTokenExpiresInDays') ?? null,
    terms: getTermsFromPayload(response.data),
    user: {
      ...user,
      terms: getTermsFromPayload(response.data) ?? user.terms ?? null,
    },
    raw: response.data,
  };
}

// Submits versioned re-acceptance of the live Terms + Privacy Policy.
export async function acceptTermsRequest(token: string): Promise<void> {
  await apiClient<unknown>('/user/accept-terms', {
    method: 'PATCH',
    token,
    body: { acceptedTerms: true, acceptedPrivacyPolicy: true },
  });
}

// Starts Google OAuth: returns the backend auth URL plus the CSRF state and
// PKCE verifier the client must hold and return on the callback.
export async function googleLoginRequest(): Promise<{ authUrl: string; state: string; codeVerifier: string }> {
  const response = await apiClient<Record<string, unknown>>('/auth/google', { method: 'GET' });
  const data = (response.data?.data ?? response.data) as Record<string, unknown>;
  const authUrl = data.authUrl;
  const state = data.state;
  const codeVerifier = data.codeVerifier;
  if (typeof authUrl !== 'string' || typeof state !== 'string' || typeof codeVerifier !== 'string') {
    throw new ApiError('Google login is not configured on the server', 502, response.data);
  }
  return { authUrl, state, codeVerifier };
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient<unknown>('/auth/forgot-password', {
    method: 'POST',
    body: { identifier: email },
  });
}

export async function resetPasswordRequest(token: string, password: string): Promise<void> {
  await apiClient<unknown>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}

export async function getProfileRequest(token: string) {
  const response = await apiClient<BackendLoginResponse>('/user/profile', {
    method: 'GET',
    token,
  });

  return normalizeUser(response.data, token);
}

export async function updateProfileRequest(payload: unknown, token: string) {
  const response = await apiClient<BackendLoginResponse>('/user/profile', {
    method: 'PUT',
    body: payload,
    token,
  });

  return normalizeUser(response.data, token);
}

export async function changePasswordRequest(payload: unknown, token: string) {
  await apiClient<unknown>('/auth/change-password', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function registerRequest(payload: RegisterRequest): Promise<RegisterResult> {
  const response = await apiClient<BackendRegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });

  return {
    message:
      typeof response.data.message === 'string'
        ? response.data.message
        : undefined,
    otpChannel:
      response.data.otpChannel === 'sms' || response.data.otpChannel === 'email'
        ? response.data.otpChannel
        : undefined,
    raw: response.data,
  };
}
