'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Permission, Role } from '@/lib/rbac';
import { Loader2Icon } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}) => {
  const { user, selectedRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user has the specific role allowed
      if (requiredRole && selectedRole !== requiredRole && !user.roles.includes(requiredRole) && !user.roles.includes('tester')) {
        router.push('/access-denied');
        return;
      }

      // Check for specific permission
      if (requiredPermission && !user.permissions.includes(requiredPermission) && !user.roles.includes('tester')) {
        router.push('/access-denied');
        return;
      }
    }
  }, [user, selectedRole, isLoading, router, requiredRole, requiredPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2Icon className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};
