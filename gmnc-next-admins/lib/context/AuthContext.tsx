'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDashboardRoute, getDefaultRoleForUserType, getEffectiveRoles } from '../rbac';
import { useRouter } from 'next/navigation';

// =========================================
// TYPES
// =========================================
export type Role = 'admin' | 'provider' | 'support' | 'tester' | (string & Record<never, never>);

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  roles: string[];
  permissions: string[];
  userType?: string;
  profession?: string;
  serviceProvider?: {
    id: string;
    profession?: string;
    userId?: string;
    user?: {
      id: string;
      fullName?: string;
    };
  };
  provider?: {
    id: string;
    profession?: string;
    userId?: string;
    user?: {
      id: string;
      fullName?: string;
    };
  };
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email?: string;
    password: string;
    phoneNumber: string;
    gender: 'MALE' | 'FEMALE';
    role: 'SERVICE_PROVIDER' | 'ADMIN';
    profileImage?: string;
    address?: string;
    digitalAddress?: string;
    otpChannel: 'sms' | 'email';
    verified?: boolean;
    profileCompleted?: boolean;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =========================================
// HELPERS
// =========================================

/**
 * Normalise the raw API user object so that both `name` and `fullName`
 * are always present, matching what the rest of the app expects.
 */
function getTokenUserType(token?: string | null): string | undefined {
  if (!token) return undefined;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return undefined;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    return typeof payload.userType === 'string' ? payload.userType : undefined;
  } catch {
    return undefined;
  }
}

function normaliseUser(raw: Record<string, unknown>, token?: string | null): User {
  const name = (raw.name as string | undefined) ?? (raw.fullName as string | undefined) ?? '';
  return {
    ...((raw as unknown) as User),
    name,
    fullName: name,
    roles: Array.isArray(raw.roles) ? (raw.roles as string[]) : [],
    permissions: Array.isArray(raw.permissions) ? (raw.permissions as string[]) : [],
    userType: (raw.userType as string | undefined) ?? getTokenUserType(token),
  };
}

/**
 * Persist auth data to localStorage so that child pages that read
 * localStorage("user") / localStorage("token") always find fresh values.
 */
function persistAuth(user: User, token: string) {
  try {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    // Also keep the gmnc-namespaced copy in case other code uses it
    localStorage.setItem('gmnc_user', JSON.stringify(user));
    localStorage.setItem('gmnc_token', token);
  } catch {
    // localStorage may be unavailable in some SSR/incognito contexts
  }
}

/**
 * Clear all auth-related localStorage keys on logout.
 */
function clearAuth() {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('gmnc_selected_role');
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('gmnc_'));
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    const sessionKeysToRemove = Object.keys(sessionStorage).filter((k) =>
      k.startsWith('gmnc_'),
    );
    sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

function resolveSelectedRole(user: User, storedRole?: string | null): Role | null {
  const effectiveRoles = getEffectiveRoles(user);

  if (storedRole && effectiveRoles.includes(storedRole as Role)) {
    return storedRole as Role;
  }
  if (effectiveRoles.includes('admin')) return 'admin';
  return (user.roles[0] as Role) ?? getDefaultRoleForUserType(user.userType);
}

// =========================================
// PROVIDER
// =========================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const caregiverBlocked = sessionStorage.getItem('gmnc_caregiver_blocked');
    if (caregiverBlocked) {
      sessionStorage.removeItem('gmnc_caregiver_blocked');
      setError('Caregivers cannot access this portal.');
      router.replace('/login');
    }
  }, [router]);

  // =========================================
  // HYDRATE FROM /api/auth/me ON MOUNT
  // =========================================
  useEffect(() => {
    let isMounted = true;

     async function hydrateAuth() {
       try {
         const storedToken = localStorage.getItem('token') ?? '';
         const response = await fetch('/api/auth/me', {
           method: 'GET',
           cache: 'no-store',
           credentials: 'include',
           headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : undefined,
         });

        if (!response.ok) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setSelectedRoleState(null);
          }
          return;
        }

        const data = await response.json() as {
          user?: Record<string, unknown> | null;
          accessToken?: string | null;
        };

        if (!isMounted || !data.user) return;

        const accessToken = data.accessToken ?? '';
        const normalisedUser = normaliseUser(data.user, accessToken);
        const storedRole = localStorage.getItem('gmnc_selected_role');

        setUser(normalisedUser);
        setToken(accessToken);
        setSelectedRoleState(resolveSelectedRole(normalisedUser, storedRole));

        persistAuth(normalisedUser, accessToken);
      } catch {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setSelectedRoleState(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void hydrateAuth();
    return () => { isMounted = false; };
  }, []);

  // =========================================
  // LOGIN
  // =========================================
  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json() as {
        user?: Record<string, unknown>;
        accessToken?: string;
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? 'Login failed');
        return;
      }

      const accessToken = data.accessToken ?? '';
      const normalisedUser = normaliseUser(data.user, accessToken);
      if ((normalisedUser.userType ?? '').toUpperCase() === 'CAREGIVER') {
        setError('Caregivers cannot access this portal.');
        router.replace('/login');
        router.refresh();
        return;
      }

      const role = resolveSelectedRole(normalisedUser);

      setUser(normalisedUser);
      setToken(accessToken);
      setSelectedRoleState(role);

      persistAuth(normalisedUser, accessToken);

      if (role) {
        localStorage.setItem('gmnc_selected_role', role);
        router.replace(getDashboardRoute(role));
      } else {
        localStorage.removeItem('gmnc_selected_role');
        router.replace('/dashboard');
      }

      router.refresh();
    } catch {
      setError('Unable to sign in right now');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // REGISTER
  // =========================================
  const register = async (data: {
    fullName: string;
    email?: string;
    password: string;
    phoneNumber: string;
    gender: 'MALE' | 'FEMALE';
    role: 'SERVICE_PROVIDER' | 'CAREGIVER' | 'ADMIN';
    profileImage?: string;
    address?: string;
    digitalAddress?: string;
    otpChannel: 'sms' | 'email';
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json() as { message?: string };

      if (!response.ok) {
        setError(responseData.message ?? 'Registration failed');
        return;
      }

      setUser(null);
      setToken(null);
      setSelectedRoleState(null);
      clearAuth();

      router.replace('/admin/users');
      router.refresh();
    } catch {
      setError('Unable to register right now');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // SET SELECTED ROLE
  // =========================================
  const setSelectedRole = (role: Role) => {
    setSelectedRoleState(role);
    localStorage.setItem('gmnc_selected_role', role);
    router.replace(getDashboardRoute(role as Parameters<typeof getDashboardRoute>[0]));
    router.refresh();
  };

  // =========================================
  // LOGOUT
  // =========================================
  const logout = () => {
    void (async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // Network error — proceed with local cleanup anyway
      } finally {
        setUser(null);
        setToken(null);
        setSelectedRoleState(null);
        clearAuth();
        window.location.href = '/login';
      }
    })();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedRole,
        setSelectedRole,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
