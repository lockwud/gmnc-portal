"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import AssignmentTable from "./AssignmentTable";
import AssignRoleModal from "./AssignRoleModal";
import RoleFilterDropdown from "@/components/admin/roles-access/RoleFilterDropdown";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

import type {
  AppRoleRecord,
  UserAssignmentRecord,
  AssignmentScopeType,
} from "@/lib/api/types";

// =========================================
// TYPES
// =========================================
type AuthUser = {
  id: string;
  email?: string;
  /** The API returns `name`; components may expect `fullName` */
  name?: string;
  fullName?: string;
  userType?: string;
  roles?: string[];
  permissions?: string[];
};

// =========================================
// COMPONENT
// =========================================
export default function RoleAssignmentsPage() {
  const { show } = useToast();
  const { user: authUser, token, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<AssignmentScopeType>('GLOBAL');

  const [roles, setRoles] = useState<AppRoleRecord[]>([]);
  const [users, setUsers] = useState<
    { id: string; fullName: string; email?: string; userType: string }[]
  >([]);
  const [assignments, setAssignments] = useState<UserAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // =========================================
  // AUTH HEADERS — always read fresh from storage
  // =========================================
  const getAuthHeaders = useCallback((): Record<string, string> => {
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    };
  }, [token]);

  const isAdmin = useMemo(
    () =>
      currentUser?.userType === 'ADMIN' ||
      !!currentUser?.roles?.some((currentRole) => currentRole.toLowerCase() === 'admin'),
    [currentUser?.roles, currentUser?.userType],
  );

  const readErrorMessage = async (response: Response, fallback: string) => {
    const data = await response.json().catch(() => null);
    return data?.message || data?.error || fallback;
  };

  // =========================================
  // LOAD CURRENT USER
  // AuthProvider is the source of truth for the current portal user.
  // =========================================
  useEffect(() => {
    if (authLoading) return;

    const timeoutId = window.setTimeout(() => {
      if (!authUser) {
        setCurrentUser(null);
        setUsers([]);
        setAssignments([]);
        setLoading(false);
        setInitialized(true);
        return;
      }

      setCurrentUser({
        id: authUser.id,
        email: authUser.email ?? undefined,
        name: authUser.name,
        fullName: authUser.fullName ?? authUser.name,
        userType: authUser.userType,
        roles: authUser.roles,
        permissions: authUser.permissions,
      });
      setInitialized(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [authLoading, authUser]);

  // =========================================
  // FETCH ROLES + USERS
  // =========================================
  useEffect(() => {
    if (!initialized || !currentUser?.id) return;

    const controller = new AbortController();
    let active = true;

    const fetchData = async () => {
      try {
        setLoadError(null);
        setLoading(true);

        const rolesResponse = await fetch("/api/admin/rbac/roles?lite=true", {
          headers: getAuthHeaders(),
          credentials: 'include',
          signal: controller.signal,
        });

        if (!rolesResponse.ok) {
          throw new Error(await readErrorMessage(rolesResponse, "Failed to fetch roles"));
        }

        const rolesData = await rolesResponse.json();
        const nextRoles = Array.isArray(rolesData) ? rolesData : rolesData.data ?? [];

        let usersData: {
          id: string;
          fullName: string;
          email?: string;
          userType: string;
        }[] = [];

        if (!isAdmin) {
          usersData = [{
            id: currentUser.id,
            fullName: currentUser.fullName || currentUser.name || currentUser.email || 'Current user',
            email: currentUser.email,
            userType: currentUser.userType || 'SERVICE_PROVIDER',
          }];
        } else {
          const usersResponse = await fetch("/api/admin/users", {
            headers: getAuthHeaders(),
            credentials: 'include',
            signal: controller.signal,
          });

          if (!usersResponse.ok) {
            throw new Error(await readErrorMessage(usersResponse, "Failed to fetch users"));
          }

          const data = await usersResponse.json();
          const raw: Record<string, unknown>[] = data.data ?? data ?? [];

          usersData = raw.map((u) => ({
            ...(u as { id: string; email?: string; userType: string }),
            fullName:
              (u.fullName as string | undefined) ??
              (u.name as string | undefined) ??
              "",
          }));
        }

        if (!active) return;
        setRoles(nextRoles);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        if (!active || (err instanceof DOMException && err.name === 'AbortError')) return;
        console.error(err);
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentUser?.email, currentUser?.fullName, currentUser?.id, currentUser?.name, currentUser?.userType, getAuthHeaders, initialized, isAdmin]);

  // =========================================
  // FETCH ASSIGNMENTS FOR ALL USERS
  // =========================================
useEffect(() => {
  if (users.length === 0) return;

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const allAssignments: UserAssignmentRecord[] = [];

      // Batch fetch roles for all users to avoid N+1 requests
      const userIdsParam = users.map((u) => u.id).join(",");
      const batchResp = await fetch(`/api/admin/rbac/users/roles?userIds=${encodeURIComponent(userIdsParam)}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (batchResp.ok) {
        const batchJson = await batchResp.json();
        const map = batchJson?.data ?? {};
        for (const user of users) {
          const userRoles = Array.isArray(map[user.id]) ? map[user.id] : [];
          for (const role of userRoles) {
            allAssignments.push({
              id: `${user.id}-${role.id}`,
              userId: user.id,
              userName: user.fullName,
              email: user.email ?? "",
              roleSlug: role.role.slug,
              roleName: role.role.name,
              scopeType: role.scopeType,
              scopeId: role.scopeId,
              grantedAt: role.grantedAt,
              expiresAt: role.expiresAt,
              active: role.active,
            });
          }
        }
      }

      setAssignments(allAssignments);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAssignments();
}, [users]);

  // =========================================
  // FILTER
  // =========================================
  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => roleFilter === "ALL" || a.roleSlug === roleFilter,
      ),
    [assignments, roleFilter],
  );

  // =========================================
  // PAGINATION
  // =========================================
  const totalItems = filteredAssignments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // =========================================
  // REFRESH ASSIGNMENTS HELPER
  // =========================================
  const refreshAssignments = async () => {
    const updated: UserAssignmentRecord[] = [];
    if (users.length === 0) {
      setAssignments([]);
      return;
    }

    const userIdsParam = users.map((u) => u.id).join(",");
    const batchResp = await fetch(`/api/admin/rbac/users/roles?userIds=${encodeURIComponent(userIdsParam)}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (batchResp.ok) {
      const batchJson = await batchResp.json();
      const map = batchJson?.data ?? {};
      for (const user of users) {
        const userRoles = Array.isArray(map[user.id]) ? map[user.id] : [];
        for (const role of userRoles) {
          updated.push({
            id: `${user.id}-${role.id}`,
            userId: user.id,
            userName: user.fullName,
            email: user.email ?? "",
            roleSlug: role.role.slug,
            roleName: role.role.name,
            scopeType: role.scopeType,
            scopeId: role.scopeId,
            grantedAt: role.grantedAt ?? new Date().toISOString(),
            expiresAt: role.expiresAt,
            active: role.active,
          });
        }
      }
    }

    setAssignments(updated);
  };

  // =========================================
  // ASSIGN ROLE
  // =========================================
  const handleAssignRole = async (userId: string, roleId: string, scopeType: AssignmentScopeType) => {
    try {
      show({
        title: "Assigning role...",
        message: "Please wait while we assign the role.",
        type: "loading",
        duration: 0,
      });

      const response = await fetch(`/api/admin/rbac/users/${userId}/roles`, {
        method: "POST",
        headers: getAuthHeaders(),
      body: JSON.stringify({
          roleId,
          scopeType: scopeType,
          scopeId: "",
        }),
      });

      if (!response.ok) throw new Error("Failed to assign role");

      await refreshAssignments();

      setIsAssignModalOpen(false);

      show({
        title: "Success",
        message: "Role assigned successfully.",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      show({
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to assign role",
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-base font-semibold text-slate-900">Unable to load account</h1>
          <p className="mt-2 text-sm text-slate-500">Please sign in again to manage role assignments.</p>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================
  return (
    <>
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-[15px] font-semibold text-slate-900">
              Manage Role Assignments
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Assign roles to users to manage their access and permissions.
            </p>
            {loadError ? (
              <p className="mt-2 max-w-3xl rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {loadError}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <RoleFilterDropdown
              value={roleFilter}
              options={[
                { value: "ALL", label: "All roles" },
                ...roles.map((role) => ({
                  value: role.slug,
                  label: role.name,
                })),
              ]}
              onChange={setRoleFilter}
              ariaLabel="Filter assignments by role"
              widthClass="w-[180px]"
            />

            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Plus size={10} strokeWidth={2.5} />
              </span>
              Assign role
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-4 pb-4">
          <div className="flex h-full min-h-0 flex-col gap-2">
            {totalItems === 0 ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
                <div className="w-full max-w-md">
                  <EmptyState
                    title="No role assignments found"
                    description={
                      users.length === 0
                        ? "No users available to assign roles to."
                        : "No assignments match the selected filters."
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <AssignmentTable
                  assignments={paginatedAssignments}
                  onRevoke={async (assignment) => {
                    try {
                      show({
                        title: 'Revoking role...',
                        message: 'Please wait while we revoke the role.',
                        type: 'loading',
                        duration: 0,
                      });

                      // Find the role ID from the roles list using the slug
                      const role = roles.find((r) => r.slug === assignment.roleSlug);
                      const roleId = role?.id || assignment.roleSlug;

                      const response = await fetch(
                        `/api/admin/rbac/users/${assignment.userId}/roles/${roleId}`,
                        {
                          method: 'DELETE',
                          headers: getAuthHeaders(),
                        }
                      );

                      if (!response.ok) throw new Error('Failed to revoke role');

                      await refreshAssignments();

                      show({
                        title: 'Success',
                        message: 'Role revoked successfully.',
                        type: 'success',
                        duration: 3000,
                      });
                    } catch (err) {
                      show({
                        title: 'Error',
                        message: err instanceof Error ? err.message : 'Failed to revoke role',
                        type: 'error',
                        duration: 4000,
                      });
                    }
                  }}
                />

                <div className="border border-slate-200 bg-white">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AssignRoleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleAssignRole}
        users={users.filter(
          (user) => !assignments.some((a) => a.userId === user.id)
        )}
        roles={roles}
        selectedRole={selectedRole}
        onChangeRole={setSelectedRole}
        selectedScope={selectedScope}
        onChangeScope={setSelectedScope}
        selectedUserId={selectedUserId}
        onChangeUserId={setSelectedUserId}
        selectedExpiryDate={null}
        onChangeExpiryDate={() => {}}
      />
    </>
  );
}
