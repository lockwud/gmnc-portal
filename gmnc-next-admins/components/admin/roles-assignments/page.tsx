'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import AssignmentTable from './AssignmentTable';
import AssignRoleModal from './AssignRoleModal';
import RoleFilterDropdown from '@/components/admin/roles-access/RoleFilterDropdown';
import { Plus } from 'lucide-react';
import type { AppRoleRecord, UserAssignmentRecord, AssignmentScopeType } from '@/lib/api/types';


export default function RoleAssignmentsPage() {
  const { show } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [roles, setRoles] = useState<AppRoleRecord[]>([]);
  const [users, setUsers] = useState<{ id: string; fullName: string; email?: string; userType: string }[]>([]);
  const [assignments, setAssignments] = useState<UserAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // Get current user info
  const didSetUser = useRef(false);
  useEffect(() => {
    if (!didSetUser.current) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
      didSetUser.current = true;
    }
  }, []);

  // Fetch roles and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await fetch('/api/admin/rbac/roles', {
          headers: getAuthHeaders(),
        });
        if (!rolesResponse.ok) throw new Error('Failed to fetch roles');
        const rolesData = await rolesResponse.json();
        setRoles(Array.isArray(rolesData) ? rolesData : []);

        // Fetch users - if SERVICE_PROVIDER, only get their users
        let usersData: User[] = [];
        
        if (currentUser?.userType === 'SERVICE_PROVIDER') {
          // Get service provider's users
          const spResponse = await fetch(`/api/service-provider/${currentUser?.id}`, {
            headers: getAuthHeaders(),
          });
          if (spResponse.ok) {
            const spData = await spResponse.json();
            usersData = spData.users || [];
          }
        } else {
          // Admin: get all users
          const usersResponse = await fetch('/api/admin/users', {
            headers: getAuthHeaders(),
          });
          if (usersResponse.ok) {
            const data = await usersResponse.json();
            usersData = data.data || data || [];
          }
        }
        
        setUsers(Array.isArray(usersData) ? usersData : []);

      } catch (err) {
        show({
          title: 'Error loading assignments',
          message: err instanceof Error ? err.message : 'Failed to load data',
          type: 'error',
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchData();
    }
  }, [show, currentUser?.id, currentUser?.userType]);

  // Fetch assignments when users change
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const allAssignments: UserAssignmentRecord[] = [];

        for (const user of users) {
          const rolesResponse = await fetch(`/api/admin/rbac/users/${user.id}/roles`, {
            headers: getAuthHeaders(),
          });

          if (rolesResponse.ok) {
            const userRoles = await rolesResponse.json();
            for (const role of userRoles) {
              allAssignments.push({
                id: `${user.id}-${role.id}`,
                userName: user.fullName,
                email: user.email || '',
                roleSlug: role.slug,
                roleName: role.name,
                scopeType: role.scopeType || 'GLOBAL',
                scopeId: role.scopeId || null,
                grantedAt: role.createdAt || new Date().toISOString(),
                expiresAt: role.expiresAt || null,
                active: role.active !== undefined ? role.active : true,
              });
            }
          }
        }

        setAssignments(allAssignments);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      }
    };

    if (users.length > 0) {
      fetchAssignments();
    }
  }, [users]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const roleMatch = roleFilter === 'ALL' || assignment.roleSlug === roleFilter;
      return roleMatch;
    });
  }, [roleFilter, assignments]);

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

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      show({
        title: 'Assigning role...',
        message: 'Please wait while we assign the role.',
        type: 'loading',
        duration: 0,
      });

      const response = await fetch(`/api/admin/rbac/users/${userId}/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) throw new Error('Failed to assign role');

      // Refresh assignments
      const updatedAssignments: RoleAssignment[] = [];
      for (const user of users) {
        const rolesResponse = await fetch(`/api/admin/rbac/users/${user.id}/roles`, {
          headers: getAuthHeaders(),
        });

        if (rolesResponse.ok) {
          const userRoles = await rolesResponse.json();
          for (const role of userRoles) {
            updatedAssignments.push({
              id: `${user.id}-${role.id}`,
              userId: user.id,
              roleSlug: role.slug,
              createdAt: role.createdAt || new Date().toISOString(),
              userName: user.fullName,
              userEmail: user.email,
            });
          }
        }
      }

      setAssignments(updatedAssignments);
      setIsAssignModalOpen(false);

      show({
        title: 'Success',
        message: 'Role assigned successfully.',
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to assign role',
        type: 'error',
        duration: 4000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white items-center justify-center">
        <p className="text-slate-500">Loading assignments...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-[15px] font-semibold text-slate-900">Manage Role Assignments</h1>
            <p className="mt-1 text-xs text-slate-500">
              Assign roles to users to manage their access and permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RoleFilterDropdown
              value={roleFilter}
              options={[
                { value: 'ALL', label: 'All roles' },
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

        <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-4 pb-4">
          <div className="flex h-full min-h-0 flex-col gap-2">
            {totalItems === 0 ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
                <div className="w-full max-w-md">
                  <EmptyState
                    title="No role assignments found"
                    description={users.length === 0 ? 'No users available to assign roles to.' : 'No assignments match the selected filters.'}
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
        users={users}
        roles={roles}
        selectedRole={''}
        onChangeRole={() => {}}
        selectedScope={'GLOBAL' as AssignmentScopeType}
        onChangeScope={() => {}}
      />
    </>
  );
}