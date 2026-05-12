'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import RolesSidebar from '@/components/admin/roles-access/RolesSidebar';
import RolePermissionsPanel from '@/components/admin/roles-access/RolePermissionsPanel';
import RoleCreateModal from '@/components/admin/roles-access/RoleCreateModal';
import { AssignmentScopeType, PermissionRecord, PermissionCategory } from '@/lib/api/types';
import type { AppRoleRecord, WebRoleSlug } from '@/lib/api/types';

export default function RolesAccessPage() {
  const { show } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleScopeFilter, setRoleScopeFilter] = useState<AssignmentScopeType | 'ALL'>('ALL');
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [roles, setRoles] = useState<AppRoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [permissionState, setPermissionState] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // Bootstrap admin on mount
  useEffect(() => {
    const bootstrapAdmin = async () => {
      try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          setBootstrapped(false);
          return;
        }

        const user = JSON.parse(userJson);
        if (!user?.id) {
          setBootstrapped(false);
          return;
        }

        const response = await fetch('/api/admin/rbac/bootstrap', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          console.log('✓ Admin bootstrapped successfully');
          setBootstrapped(true);
        } else {
          console.warn('Bootstrap returned non-OK status:', response.status);
          setBootstrapped(false);
        }
      } catch (err) {
        console.error('Bootstrap failed:', err);
        setBootstrapped(false);
      }
    };

    bootstrapAdmin();
  }, []);

  // Fetch roles on mount (after bootstrap)
  useEffect(() => {
    if (!bootstrapped) return;

    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/admin/rbac/roles', {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }

        const data = await response.json();

        // Handle both array and object responses
        let rolesArray: Partial<AppRoleRecord>[] = [];

        if (Array.isArray(data)) {
          rolesArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          rolesArray = data.data;
        } else if (data.roles && Array.isArray(data.roles)) {
          rolesArray = data.roles;
        }

        const rolesWithMetadata: AppRoleRecord[] = rolesArray.map((role) => ({
          id: role.id || '',
          name: role.name || 'Unnamed',
          slug: (role.slug || 'ADMIN') as WebRoleSlug,
          description: role.description || '',
          scopeType: (role.scopeType || 'GLOBAL') as AssignmentScopeType,
          // createdAt: role.createdAt || new Date().toISOString(),
          activeUsers: role.activeUsers || 0,
          isSystem: role.isSystem || false,
        }));

        setRoles(rolesWithMetadata);

        if (rolesWithMetadata.length > 0) {
          setSelectedRoleSlug(rolesWithMetadata[0].slug);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch roles error:', err);
        show({
          title: 'Failed to fetch roles',
          message: 'Could not load roles from the system.',
          type: 'error',
          duration: 4000,
        });
        setLoading(false);
      }
    };

    fetchRoles();
  }, [bootstrapped, show]);

  // Fetch permissions on mount (after bootstrap)
  useEffect(() => {
    if (!bootstrapped) return;

    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/admin/rbac/permissions', {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch permissions: ${response.status}`);
        }

        const data = await response.json();

        // Handle both array and object responses
        let permissionsArray: Partial<PermissionRecord>[] = [];

        if (Array.isArray(data)) {
          permissionsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          permissionsArray = data.data;
        } else if (data.permissions && Array.isArray(data.permissions)) {
          permissionsArray = data.permissions;
        }

        const permissionsFormatted: PermissionRecord[] = permissionsArray.map((perm) => ({
          id: perm.id || '',
          code: perm.code || '',
          name: perm.name || perm.code || 'Unnamed',
          description: perm.description || '',
          category: (perm.category as PermissionCategory) || 'ADMIN',
        }));

        setPermissions(permissionsFormatted);
      } catch (err) {
        console.error('Fetch permissions error:', err);
        show({
          title: 'Failed to fetch permissions',
          message: 'Could not load permissions from the system.',
          type: 'error',
          duration: 4000,
        });
      }
    };

    fetchPermissions();
  }, [bootstrapped, show]);

  // Fetch permissions for selected role
  useEffect(() => {
    if (!selectedRoleSlug || roles.length === 0 || !bootstrapped) return;

    const fetchRolePermissions = async () => {
      try {
        const roleId = roles.find((r) => r.slug === selectedRoleSlug)?.id;
        if (!roleId) return;

        const response = await fetch(`/api/admin/rbac/roles/${roleId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch role details');

        const roleData = await response.json();

        // Handle both direct array and nested data structure
        let perms: PermissionRecord[] = [];

        if (Array.isArray(roleData.permissions)) {
          perms = roleData.permissions;
        } else if (roleData.data && Array.isArray(roleData.data.permissions)) {
          perms = roleData.data.permissions;
        }

        const permCodes = perms.map((p) => p.code).filter(Boolean);

        setPermissionState((prev) => ({
          ...prev,
          [selectedRoleSlug]: permCodes,
        }));
      } catch (err) {
        console.error('Fetch role permissions error:', err);
      }
    };

    fetchRolePermissions();
  }, [selectedRoleSlug, roles, bootstrapped]);

  const filteredRoles = useMemo(() => {
    if (roleScopeFilter === 'ALL') return roles;
    return roles.filter((role) => role.scopeType === roleScopeFilter);
  }, [roleScopeFilter, roles]);

  const totalItems = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  const selectedRole = roles.find((role) => role.slug === selectedRoleSlug) ?? roles[0];
  const selectedPermissions = selectedRole ? permissionState[selectedRole.slug] ?? [] : [];

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<PermissionCategory, PermissionRecord[]>>((acc, permission) => {
      const category = permission.category || 'ADMIN';
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    }, {} as Record<PermissionCategory, PermissionRecord[]>);
  }, [permissions]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handlePermissionToggle = (permissionCode: string, nextChecked: boolean) => {
    if (!selectedRole) return;

    setPermissionState((prev) => {
      const current = prev[selectedRole.slug] ?? [];
      const next = nextChecked
        ? Array.from(new Set([...current, permissionCode]))
        : current.filter((code) => code !== permissionCode);

      return {
        ...prev,
        [selectedRole.slug]: next,
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      if (!selectedRole) return;

      show({
        title: 'Saving permissions...',
        message: 'Please wait while we update the permissions.',
        type: 'loading',
        duration: 0,
      });

      const permissionIds = permissions
        .filter((p) => selectedPermissions.includes(p.code))
        .map((p) => p.id);

      const response = await fetch(`/api/admin/rbac/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissionIds }),
      });

      if (!response.ok) throw new Error('Failed to update permissions');

      show({
        title: 'Success',
        message: `${selectedRole.name} permissions updated successfully.`,
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      show({
        title: 'Failed to update permissions',
        message: err instanceof Error ? err.message : 'An error occurred while saving.',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleCreateRole = async (roleData: { name: string; description?: string; scopeType: AssignmentScopeType }) => {
    try {
      show({
        title: 'Creating role...',
        message: 'Please wait while we create the role.',
        type: 'loading',
        duration: 0,
      });

      // Generate slug from name
      const slug = roleData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      const response = await fetch('/api/admin/rbac/roles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: roleData.name,
          slug,
          description: roleData.description,
          scopeType: roleData.scopeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create role');
      }

      const newRole = await response.json();

      const newRoleWithMetadata: AppRoleRecord = {
        id: newRole.id || '',
        name: newRole.name || '',
        slug: (newRole.slug || slug || 'ADMIN') as WebRoleSlug,
        description: newRole.description || '',
        scopeType: (newRole.scopeType || 'GLOBAL') as AssignmentScopeType,
        // createdAt: newRole.createdAt || new Date().toISOString(),
        activeUsers: 0,
        isSystem: false,
      };

      setRoles([...roles, newRoleWithMetadata]);
      setSelectedRoleSlug(newRoleWithMetadata.slug);

      show({
        title: 'Success',
        message: 'Role created successfully.',
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      show({
        title: 'Failed to create role',
        message: err instanceof Error ? err.message : 'An error occurred while creating the role.',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleReset = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/admin/rbac/roles/${selectedRole.id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch role details');

      const roleData = await response.json();

      // Handle both direct array and nested data structure
      let perms: PermissionRecord[] = [];

      if (Array.isArray(roleData.permissions)) {
        perms = roleData.permissions;
      } else if (roleData.data && Array.isArray(roleData.data.permissions)) {
        perms = roleData.data.permissions;
      }

      setPermissionState((prev) => ({
        ...prev,
        [selectedRole.slug]: perms.map((p) => p.code).filter(Boolean),
      }));

      show({
        title: 'Success',
        message: 'Permissions reset to original state.',
        type: 'success',
        duration: 2000,
      });
    } catch {
      show({
        title: 'Failed to reset permissions',
        message: 'Could not reset to original permissions.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 items-center justify-center bg-white">
        <p className="text-slate-500">Loading roles and permissions...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-white">
        <RolesSidebar
          roles={paginatedRoles}
          selectedRoleSlug={selectedRoleSlug}
          onSelectRole={setSelectedRoleSlug}
          roleScopeFilter={roleScopeFilter}
          onChangeScopeFilter={(value) => {
            setRoleScopeFilter(value);
            setPage(1);
          }}
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onCreate={() => setIsCreateModalOpen(true)}
        />

        {selectedRole && (
          <RolePermissionsPanel
            selectedRole={selectedRole}
            groupedPermissions={groupedPermissions}
            selectedPermissions={selectedPermissions}
            onTogglePermission={handlePermissionToggle}
            onReset={handleReset}
            onSave={handleSaveChanges}
          />
        )}
      </div>

      <RoleCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateRole}
      />
    </>
  );
}