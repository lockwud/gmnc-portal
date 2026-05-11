'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, getDashboardRoute } from '../rbac';
import { useRouter } from 'next/navigation';

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
    userType: 'SERVICE_PROVIDER' | 'CAREGIVER' | 'ADMIN';
    dateOfBirth?: string;
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

type AuthUser = User & {
  avatar?: string | null;
};

function resolveSelectedRole(nextUser: AuthUser, storedRole?: string | null) {
  if (storedRole && nextUser.roles.includes(storedRole as Role)) {
    return storedRole as Role;
  }

  if (nextUser.roles.includes('admin')) {
    return 'admin';
  }

  return nextUser.roles[0] ?? null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
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
          user?: AuthUser | null;
          accessToken?: string | null;
        };

        if (!isMounted || !data.user) {
          return;
        }

        const storedRole = localStorage.getItem('gmnc_selected_role');
        setUser(data.user);
        setToken(data.accessToken ?? null);
        setSelectedRoleState(resolveSelectedRole(data.user, storedRole));
      } catch {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setSelectedRoleState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json() as {
        user?: AuthUser;
        accessToken?: string;
        message?: string;
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? 'Login failed');
        return;
      }

      const role = resolveSelectedRole(data.user);

      setUser(data.user);
      setToken(data.accessToken ?? null);
      setSelectedRoleState(role);

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

  const setSelectedRole = (role: Role) => {
    setSelectedRoleState(role);
    localStorage.setItem('gmnc_selected_role', role);
    router.replace(getDashboardRoute(role));
    router.refresh();
  };
const register = async (data: {
  fullName: string;
  email?: string;
  password: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  userType: 'SERVICE_PROVIDER' | 'CAREGIVER' | 'ADMIN';
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json() as {
      message?: string;
      otpChannel?: 'sms' | 'email';
    };

    if (!response.ok) {
      setError(responseData.message ?? 'Registration failed');
      return;
    }

    // Registration succeeded, but backend does not return a logged-in user
    setUser(null);
    setToken(null);
    setSelectedRoleState(null);
    localStorage.removeItem('gmnc_selected_role');

    // Send them to login or a registration success page
    router.replace('/admin/users');

    router.refresh();
  } catch {
    setError('Unable to register right now');
  } finally {
    setIsLoading(false);
  }
};
  const logout = () => {
    void (async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
        });
      } catch {
        // Network error — proceed with local cleanup anyway
      } finally {
        // Clear all application state
        setUser(null);
        setToken(null);
        setSelectedRoleState(null);

        // Clear every gmnc_* key from localStorage so no stale data persists
        const keysToRemove = Object.keys(localStorage).filter((k) =>
          k.startsWith('gmnc_'),
        );
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Also clear sessionStorage in case anything was written there
        const sessionKeysToRemove = Object.keys(sessionStorage).filter((k) =>
          k.startsWith('gmnc_'),
        );
        sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));

        // Hard redirect — replaces the entire browser document so the back
        // button cannot restore the cached dashboard from memory.
        // router.replace() is a soft navigation and can be reversed by the
        // browser; window.location.href cannot.
        window.location.href = '/login';
      }
    })();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      selectedRole,
      setSelectedRole,
      login,
      register,
      logout,
      isLoading,
      error
    }}>
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
