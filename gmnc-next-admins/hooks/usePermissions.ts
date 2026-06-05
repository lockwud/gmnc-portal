'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { hasPermission as userHasPermission, type Permission } from '@/lib/rbac';

export const usePermissions = () => {
  const { user, selectedRole } = useAuth();

  const hasPermission = (permission: Permission) =>
    user ? userHasPermission(user, permission) : false;

  const hasAnyPermission = (permissions: Permission[]) =>
    permissions.some(hasPermission);

  const hasAllPermissions = (permissions: Permission[]) =>
    permissions.every(hasPermission);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: selectedRole,
  };
};
