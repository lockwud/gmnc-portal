'use client';

import { Permission } from '../lib/rbac';

export const usePermissions = () => {
  const hasPermission = (_permission: Permission) => true;

  const hasAnyPermission = (_permissions: Permission[]) => true;

  const hasAllPermissions = (_permissions: Permission[]) => true;

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: undefined,
  };
};
