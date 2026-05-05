'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, ROLE_PERMISSIONS, getDashboardRoute } from '../rbac';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Database for demo
const MOCK_DB_USERS = [
  {
    email: 'admin@getmyneurocare.com',
    password: 'password123',
    user: {
      id: '1',
      name: 'Edmond Admin',
      email: 'admin@getmyneurocare.com',
      roles: ['admin', 'provider'] as Role[],
      permissions: [...ROLE_PERMISSIONS.admin, ...ROLE_PERMISSIONS.provider],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edmond',
    },
    token: 'mock-jwt-token-admin',
  },
  {
    email: 'provider@getmyneurocare.com',
    password: 'password123',
    user: {
      id: '2',
      name: 'Dr. Sarah Adams',
      email: 'provider@getmyneurocare.com',
      roles: ['provider'] as Role[],
      permissions: ROLE_PERMISSIONS.provider,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    token: 'mock-jwt-token-provider',
  },
  {
    email: 'tester@getmyneurocare.com',
    password: 'password123',
    user: {
      id: '3',
      name: 'Super Tester',
      email: 'tester@getmyneurocare.com',
      roles: ['tester'] as Role[],
      permissions: ROLE_PERMISSIONS.tester,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tester',
    },
    token: 'mock-jwt-token-tester',
  },
  {
    email: 'support@getmyneurocare.com',
    password: 'password123',
    user: {
      id: '4',
      name: 'Alice Support',
      email: 'support@getmyneurocare.com',
      roles: ['support'] as Role[],
      permissions: ROLE_PERMISSIONS.support,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
    token: 'mock-jwt-token-support',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage
    const storedUser = localStorage.getItem('gmnc_user');
    const storedToken = localStorage.getItem('gmnc_token');
    const storedRole = localStorage.getItem('gmnc_selected_role') as Role;

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setSelectedRoleState(storedRole || null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const dbUser = MOCK_DB_USERS.find(u => u.email === email && u.password === password);

    if (dbUser) {
      setUser(dbUser.user);
      setToken(dbUser.token);
      localStorage.setItem('gmnc_user', JSON.stringify(dbUser.user));
      localStorage.setItem('gmnc_token', dbUser.token);

      // Handle Role Redirection (Always Automatic)
      // If multiple roles, pick 'admin' if present, else first one
      const role = dbUser.user.roles.includes('admin') 
        ? 'admin' 
        : dbUser.user.roles[0];
        
      setSelectedRoleState(role);
      localStorage.setItem('gmnc_selected_role', role);
      router.push('/otp');
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const setSelectedRole = (role: Role) => {
    setSelectedRoleState(role);
    localStorage.setItem('gmnc_selected_role', role);
    router.push(getDashboardRoute(role));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedRoleState(null);
    localStorage.removeItem('gmnc_user');
    localStorage.removeItem('gmnc_token');
    localStorage.removeItem('gmnc_selected_role');
    router.push('/login');
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
