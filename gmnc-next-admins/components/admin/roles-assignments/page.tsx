"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import AssignmentTable from "./AssignmentTable";
import AssignRoleModal from "./AssignRoleModal";
import RoleFilterDropdown from "@/components/admin/roles-access/RoleFilterDropdown";
import { Plus } from "lucide-react";

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

/**
 * Read and parse the current user from localStorage.
 * Handles both the raw API shape (name) and the normalised shape (fullName).
 */
function readUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed?.id) return null;

    const name =
      (parsed.fullName as string | undefined) ??
      (parsed.name as string | undefined) ??
      "";

    return {
      ...(parsed as AuthUser),
      name,
      fullName: name,
    };
  } catch {
    return null;
  }
}

function readTokenFromStorage(): string {
  try {
    return localStorage.getItem("token") ?? "";
  } catch {
    return "";
  }
}

// =========================================
// COMPONENT
// =========================================
export default function RoleAssignmentsPage() {
  const { show } = useToast();

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

  const didSetUser = useRef(false);

  // =========================================
  // AUTH HEADERS — always read fresh from storage
  // =========================================
  const getAuthHeaders = (): Record<string, string> => {
    const token = readTokenFromStorage();
    console.log('Token in getAuthHeaders:', token);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const hasRole = (role: string) =>
    !!currentUser?.roles?.includes(role);

  // =========================================
  // LOAD CURRENT USER
  // Reads from localStorage, which AuthProvider now keeps in sync.
  // =========================================
  useEffect(() => {
    if (didSetUser.current) return;
    didSetUser.current = true;

    const user = readUserFromStorage();

    if (user) {
      setCurrentUser(user);
      setInitialized(true);
    } else {
      // localStorage not populated yet — fall back to /api/auth/me
      fetch("/api/auth/me", { cache: "no-store", credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { user?: Record<string, unknown>; accessToken?: string } | null) => {
          if (!data?.user) return;

          const name =
            (data.user.fullName as string | undefined) ??
            (data.user.name as string | undefined) ??
            "";

          const normalised: AuthUser = {
            ...(data.user as AuthUser),
            name,
            fullName: name,
          };

          // Populate localStorage for subsequent reads
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
        })
        .catch(console.error);
    }
  }, []);

  // =========================================
  // FETCH ROLES + USERS
  // =========================================
  useEffect(() => {
    if (!currentUser?.id) return;

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
        setRoles(Array.isArray(rolesData) ? rolesData : rolesData.data ?? []);

        // USERS
        let usersData: {
          id: string;
          fullName: string;
          email?: string;
          userType: string;
        }[] = [];

        const isAdmin = hasRole("admin");

        if (!isAdmin) {
          // Non-admin: fetch only users under this service provider
           const spResponse = await fetch(
             `/api/service-provider/${currentUser.id}`,
             { headers: getAuthHeaders(), credentials: 'include' },
           );

          if (!spResponse.ok)
            throw new Error("Failed to fetch provider users");

          const spData = await spResponse.json();
          usersData = spData.users ?? [];
        } else {
          // Admin: fetch all users
           const usersResponse = await fetch("/api/admin/users", {
             headers: getAuthHeaders(),
             credentials: 'include',
           });

          if (!usersResponse.ok) throw new Error("Failed to fetch users");

          const data = await usersResponse.json();
          const raw: Record<string, unknown>[] = data.data ?? data ?? [];

          // Normalise fullName for each user
          usersData = raw.map((u) => ({
            ...(u as { id: string; email?: string; userType: string }),
            fullName:
              (u.fullName as string | undefined) ??
              (u.name as string | undefined) ??
              "",
          }));
        }

        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error(err);
        show({
          title: "Error loading assignments",
          message: err instanceof Error ? err.message : "Failed to load data",
          type: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // =========================================
  // FETCH ASSIGNMENTS FOR ALL USERS
  // =========================================
useEffect(() => {
  if (users.length === 0) return;

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const allAssignments: UserAssignmentRecord[] = [];

      for (const user of users) {
        const rolesResponse = await fetch(
          `/api/admin/rbac/users/${user.id}/roles`,
          { headers: getAuthHeaders(), credentials: 'include' },
        );

        if (!rolesResponse.ok) continue;

        const userRolesResponse = await rolesResponse.json();
        const userRoles = Array.isArray(userRolesResponse) ? userRolesResponse : userRolesResponse.data ?? [];

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

      setAssignments(allAssignments);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAssignments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    for (const user of users) {
       const r = await fetch(`/api/admin/rbac/users/${user.id}/roles`, {
         headers: getAuthHeaders(),
         credentials: 'include',
       });
      if (!r.ok) continue;

       const userRolesResponse = await r.json();
       const userRoles = Array.isArray(userRolesResponse) ? userRolesResponse : userRolesResponse.data ?? [];
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
                <AssignmentTable assignments={paginatedAssignments} />

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