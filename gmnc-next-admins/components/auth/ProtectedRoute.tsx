'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import type { Permission, Role } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

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

    // ROLE CHECK
    if (requiredRole) {
      const roles = Array.isArray(
        user.roles,
      )
        ? user.roles.map((r) =>
            String(r).toLowerCase(),
          )
        : [];

      const hasRole = roles.includes(
        requiredRole.toLowerCase(),
      );

      if (!hasRole) {
        router.replace('/access-denied');
      }
    }
  }, [
    user,
    isLoading,
    router,
    pathname,
    requiredRole,
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

  // SAFE ROLE CHECK
  if (requiredRole) {
    const roles = Array.isArray(user.roles)
      ? user.roles.map((r) =>
          String(r).toLowerCase(),
        )
      : [];

    const hasRole = roles.includes(
      requiredRole.toLowerCase(),
    );

    if (!hasRole) {
      return null;
    }
  }

  return <>{children}</>;
}