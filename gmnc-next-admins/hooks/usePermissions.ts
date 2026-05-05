'use client';

import { useAuth } from '../lib/context/AuthContext';
import { Permission } from '../lib/rbac';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  const hasAllPermissions = (permissions: Permission[]) => {
    if (!user) return false;
    return permissions.every((p) => user.permissions.includes(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: user?.roles,
  };
};
