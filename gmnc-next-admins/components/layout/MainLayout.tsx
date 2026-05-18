'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardRouteTransition from './DashboardRouteTransition';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/login')
    || pathname.startsWith('/forgot-password')
    || pathname.startsWith('/check-email')
    || pathname.startsWith('/otp')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/error');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
