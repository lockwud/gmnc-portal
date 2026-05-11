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
      return 'tester';
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

  return payload;
}

function normalizeUser(payload: BackendLoginResponse) {
  const rawUser = getRawUser(payload);
  const rawRoles = collectRoleValues(rawUser);
  const roles = rawRoles.map(normalizeRole).filter((role): role is Role => role !== null);

  const rawPermissions = collectPermissionValues(rawUser);

  return sessionUserSchema.parse({
    id: typeof rawUser.id === 'string' ? rawUser.id : '',
    email: typeof rawUser.email === 'string' ? rawUser.email : null,
    name:
      typeof rawUser.name === 'string'
        ? rawUser.name
        : typeof rawUser.fullName === 'string'
          ? rawUser.fullName
          : '',
    roles,
    permissions: rawPermissions,
    avatar:
      typeof rawUser.avatar === 'string'
        ? rawUser.avatar
        : typeof rawUser.profileImage === 'string'
          ? rawUser.profileImage
          : null,
  });
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

  return {
    accessToken,
    user: normalizeUser(response.data),
    raw: response.data,
  };
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