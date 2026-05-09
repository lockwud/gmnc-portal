'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
      <div className="flex flex-1 flex-col transition-all">
        <TopBar onToggleSidebar={() => setSidebarCollapsed((s) => !s)} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}