'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/lib/rbac';

interface RequirePermissionProps {
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = usePermissions();

  const allowed = (!permission || hasPermission(permission))
    && (!anyPermission || hasAnyPermission(anyPermission))
    && (!allPermissions || hasAllPermissions(allPermissions));

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};
