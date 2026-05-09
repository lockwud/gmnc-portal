'use client';

import React from 'react';
import { Permission, Role } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
}) => {
  return <>{children}</>;
};
