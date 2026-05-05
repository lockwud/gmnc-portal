'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/rbac';

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
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyPermission) {
    isAllowed = hasAnyPermission(anyPermission);
  } else if (allPermissions) {
    isAllowed = hasAllPermissions(allPermissions);
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
