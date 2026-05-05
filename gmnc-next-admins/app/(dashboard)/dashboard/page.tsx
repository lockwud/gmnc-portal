'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { getDashboardRoute } from '@/lib/rbac';

export default function DashboardPage() {
  const { user, selectedRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const roleToUse = selectedRole || user.roles[0];
      if (roleToUse) {
        router.push(getDashboardRoute(roleToUse));
      }
    }
  }, [user, selectedRole, isLoading, router]);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Redirecting to your workspace...</p>
    </div>
  );
}
