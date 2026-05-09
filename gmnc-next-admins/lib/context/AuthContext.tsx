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

        const data = await response.json() as { user?: AuthUser | null };

        if (!isMounted || !data.user) {
          return;
        }

        const storedRole = localStorage.getItem('gmnc_selected_role');
        setUser(data.user);
        setToken(null);
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
        message?: string;
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? 'Login failed');
        return;
      }

      const role = resolveSelectedRole(data.user);

      setUser(data.user);
      setToken(null);
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

  const logout = () => {
    void (async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
        });
      } finally {
        setUser(null);
        setToken(null);
        setSelectedRoleState(null);
        localStorage.removeItem('gmnc_selected_role');
        router.replace('/login');
        router.refresh();
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
