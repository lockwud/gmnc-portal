'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardRouteTransition from './DashboardRouteTransition';
import { useAuth } from '@/lib/context/AuthContext';
import { canAccessDashboardPath } from '@/lib/rbac';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAuthRoute = pathname.startsWith('/login')
    || pathname.startsWith('/forgot-password')
    || pathname.startsWith('/check-email')
    || pathname.startsWith('/otp')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/error');

  const canAccessPath = user ? canAccessDashboardPath(user, pathname) : false;

  useEffect(() => {
    if (isAuthRoute) return;
    if (isLoading) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!canAccessPath) {
      router.replace('/access-denied');
    }
  }, [canAccessPath, isAuthRoute, isLoading, pathname, router, user]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading || !user || !canAccessPath) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-content-bg)' }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-all">
        <TopBar onToggleSidebar={() => setSidebarCollapsed((s) => !s)} />
        <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden p-6">
          <DashboardRouteTransition>{children}</DashboardRouteTransition>
        </main>
      </div>
    </div>
  );
}
