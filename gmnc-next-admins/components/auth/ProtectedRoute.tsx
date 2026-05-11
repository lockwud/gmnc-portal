'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Permission, Role } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('next', pathname);
      router.replace(loginUrl.pathname + loginUrl.search);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Optional: Check role/permission if needed
  if (requiredRole && !user.roles.includes(requiredRole)) {
    router.replace('/access-denied');
    return null;
  }

  return <>{children}</>;
};
