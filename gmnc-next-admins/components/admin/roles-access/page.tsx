"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import RolesSidebar from "@/components/admin/roles-access/RolesSidebar";
import RolePermissionsPanel from "@/components/admin/roles-access/RolePermissionsPanel";
import RoleCreateModal from "@/components/admin/roles-access/RoleCreateModal";
import {
  AssignmentScopeType,
  PermissionRecord,
  PermissionCategory,
} from "@/lib/api/types";
import type { AppRoleRecord } from "@/lib/api/types";

// =========================================
// TYPES
// =========================================
type AuthUser = {
  id: string;
  roles?: string[];
  permissions?: string[];
};

/**
 * Read and parse the current user from localStorage.
 * AuthProvider writes here after login / hydration.
 */
function readUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed?.id) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

function readTokenFromStorage(): string {
  try {
    const token = localStorage.getItem("token") ?? "";
    if (token) return token;
    // Fallback: read from cookie if localStorage is empty
    const match = document.cookie.match(/(?:^|; )gmnc_access_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

// =========================================
// COMPONENT
// =========================================
export default function RolesAccessPage() {
  const { show } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleScopeFilter, setRoleScopeFilter] = useState<
    AssignmentScopeType | "ALL"
  >("ALL");
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [roles, setRoles] = useState<AppRoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [permissionState, setPermissionState] = useState<
    Record<string, string[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  // =========================================
  // AUTH HEADERS — always read fresh from storage
  // =========================================
  const getAuthHeaders = (): Record<string, string> => ({
    Authorization: `Bearer ${readTokenFromStorage()}`,
    "Content-Type": "application/json",
  });

  // =========================================
  // LOAD CURRENT USER
  // Reads from localStorage which AuthProvider keeps in sync.
  // Falls back to /api/auth/me if localStorage is empty.
  // =========================================
  useEffect(() => {
    const user = readUserFromStorage();

    if (user) {
      setCurrentUser(user);
      setInitialized(true);
    } else {
      // localStorage not yet populated — fetch from /api/auth/me
      fetch("/api/auth/me", { cache: "no-store", credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (
            data: {
              user?: Record<string, unknown>;
              accessToken?: string;
            } | null,
          ) => {
            if (!data?.user) return;

            const normalised = data.user as AuthUser;

            try {
              localStorage.setItem("user", JSON.stringify(normalised));
              if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
              }
            } catch {
              // ignore
            }

            setCurrentUser(normalised);
            setInitialized(true);
          },
        )
        .catch(console.error);
    }
  }, []);

  // =========================================
  // BOOTSTRAP RBAC
  // =========================================
  useEffect(() => {
    if (!currentUser?.id) return;

    const bootstrapAdmin = async () => {
      try {
     const response = await fetch("/api/admin/rbac/bootstrap", {
       method: "POST",
       headers: getAuthHeaders(),
       credentials: 'include',
       body: JSON.stringify({ userId: currentUser.id }),
     });

        setBootstrapped(response.ok);
      } catch (err) {
        console.error("Bootstrap failed:", err);
        setBootstrapped(false);
        show({
          title: "Bootstrap failed",
          message: "Failed to initialize RBAC system.",
          type: "error",
          duration: 4000,
        });
      }
    };

    bootstrapAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // =========================================
  // FETCH ROLES + PERMISSIONS
  // =========================================
  useEffect(() => {
    if (bootstrapped === null) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // ROLES
        const rolesResponse = await fetch("/api/admin/rbac/roles", {
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!rolesResponse.ok) throw new Error("Failed to fetch roles");

        const rolesData = await rolesResponse.json();
        const rolesArray: AppRoleRecord[] = Array.isArray(rolesData)
          ? rolesData
          : rolesData.data ?? [];

        setRoles(rolesArray);

        if (rolesArray.length > 0) {
          setSelectedRoleSlug(rolesArray[0].slug);
        }

        // PERMISSIONS
        const permissionsResponse = await fetch("/api/admin/rbac/permissions", {
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!permissionsResponse.ok)
          throw new Error("Failed to fetch permissions");

        const permissionsData = await permissionsResponse.json();
        const permissionsArray: PermissionRecord[] = Array.isArray(
          permissionsData,
        )
          ? permissionsData
          : permissionsData.data ?? [];

        setPermissions(permissionsArray);
      } catch (err) {
        console.error(err);
        show({
          title: "Error",
          message:
            err instanceof Error ? err.message : "Failed to load RBAC data",
          type: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped]);

  // =========================================
  // FETCH PERMISSIONS FOR SELECTED ROLE
  // =========================================
  useEffect(() => {
    if (!selectedRoleSlug || roles.length === 0) return;

    const fetchRolePermissions = async () => {
      try {
        const role = roles.find((r) => r.slug === selectedRoleSlug);
        if (!role) return;

         const response = await fetch(`/api/admin/rbac/roles/${role.id}`, {
           headers: getAuthHeaders(),
           credentials: 'include',
         });

        if (!response.ok) throw new Error("Failed to fetch role permissions");

        const roleData = await response.json();
        const perms: PermissionRecord[] = Array.isArray(roleData.permissions)
          ? roleData.permissions
          : roleData.data?.permissions ?? [];

        setPermissionState((prev) => ({
          ...prev,
          [selectedRoleSlug]: perms
            .map((p) => p.code)
            .filter(Boolean) as string[],
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchRolePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleSlug, roles]);

  // =========================================
  // FILTERED ROLES + PAGINATION
  // =========================================
  const filteredRoles = useMemo(() => {
    if (roleScopeFilter === "ALL") return roles;
    return roles.filter((role) => role.scopeType === roleScopeFilter);
  }, [roleScopeFilter, roles]);

  const totalItems = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  const selectedRole =
    roles.find((role) => role.slug === selectedRoleSlug) ?? roles[0];

  const selectedPermissions = selectedRole
    ? (permissionState[selectedRole.slug] ?? [])
    : [];

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<PermissionCategory, PermissionRecord[]>>(
      (acc, permission) => {
        const category = permission.category ?? ("ADMIN" as PermissionCategory);
        if (!acc[category]) acc[category] = [];
        acc[category].push(permission);
        return acc;
      },
      {} as Record<PermissionCategory, PermissionRecord[]>,
    );
  }, [permissions]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // =========================================
  // TOGGLE PERMISSION
  // =========================================
  const handlePermissionToggle = (
    permissionCode: string,
    nextChecked: boolean,
  ) => {
    if (!selectedRole) return;

    setPermissionState((prev) => {
      const current = prev[selectedRole.slug] ?? [];
      const next = nextChecked
        ? Array.from(new Set([...current, permissionCode]))
        : current.filter((code) => code !== permissionCode);
      return { ...prev, [selectedRole.slug]: next };
    });
  };

  // =========================================
  // SAVE PERMISSIONS
  // =========================================
  const handleSaveChanges = async () => {
    try {
      if (!selectedRole) return;

      const permissionIds = permissions
        .filter((p) => selectedPermissions.includes(p.code))
        .map((p) => p.id);

      const response = await fetch(
        `/api/admin/rbac/roles/${selectedRole.id}/permissions`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ permissionIds }),
        },
      );

      if (!response.ok) throw new Error("Failed to update permissions");

      show({
        title: "Success",
        message: "Permissions updated successfully",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      show({
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to update permissions",
        type: "error",
        duration: 4000,
      });
    }
  };

  // =========================================
  // RESET PERMISSIONS
  // =========================================
  const handleReset = async () => {
    try {
      if (!selectedRole) return;

      const response = await fetch(`/api/admin/rbac/roles/${selectedRole.id}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch role");

      const roleData = await response.json();
      const perms: PermissionRecord[] = Array.isArray(roleData.permissions)
        ? roleData.permissions
        : roleData.data?.permissions ?? [];

      setPermissionState((prev) => ({
        ...prev,
        [selectedRole.slug]: perms
          .map((p) => p.code)
          .filter(Boolean) as string[],
      }));

      show({
        title: "Success",
        message: "Permissions reset to default",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      show({
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to reset permissions",
        type: "error",
        duration: 4000,
      });
    }
  };

  // =========================================
  // LOADING STATE
  // =========================================
  if (!initialized) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (loading || bootstrapped === null) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================
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
            isLoading={loading}
          />
        )}
      </div>

      <RoleCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async () => {}}
      />
    </>
  );
}