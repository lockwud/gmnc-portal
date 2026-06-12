'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { hasPermission, hasRole, type Permission, type Role } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  const router = useRouter();
  const pathname = usePathname() ?? '';

  useEffect(() => {
    if (isLoading) return;

    // NOT LOGGED IN
    if (!user) {
      const loginUrl = new URL(
        '/login',
        window.location.origin,
      );

      loginUrl.searchParams.set(
        'next',
        pathname,
      );

      router.replace(
        loginUrl.pathname +
          loginUrl.search,
      );

      return;
    }

    const roleAllowed = !requiredRole || hasRole(user, requiredRole);
    const permissionAllowed = !requiredPermission || hasPermission(user, requiredPermission);

    if (!roleAllowed || !permissionAllowed) {
      router.replace('/access-denied');
    }
  }, [
    user,
    isLoading,
    router,
    pathname,
    requiredRole,
    requiredPermission,
  ]);

  // LOADING
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // WAIT FOR REDIRECT
  if (!user) {
    return null;
  }

  const roleAllowed = !requiredRole || hasRole(user, requiredRole);
  const permissionAllowed = !requiredPermission || hasPermission(user, requiredPermission);

  if (!roleAllowed || !permissionAllowed) {
    return null;
  }

  return <>{children}</>;
}
