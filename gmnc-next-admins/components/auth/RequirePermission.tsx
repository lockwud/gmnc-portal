'use client';

import React from 'react';
import { Permission } from '@/lib/rbac';

interface RequirePermissionProps {
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
}) => {
  return <>{children}</>;
};
