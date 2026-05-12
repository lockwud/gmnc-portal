'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import RoleFilterDropdown from '@/components/admin/roles-access/RoleFilterDropdown';
import RoleScopeBadge from '@/components/admin/roles-access/RoleScopeBadge';
import { AppRoleRecord, AssignmentScopeType } from '@/lib/api/types';
import { Plus } from 'lucide-react';

export default function RolesSidebar({
  roles,
  selectedRoleSlug,
  onSelectRole,
  roleScopeFilter,
  onChangeScopeFilter,
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onCreate,
}: {
  roles: AppRoleRecord[];
  selectedRoleSlug: string;
  onSelectRole: (slug: string) => void;
  roleScopeFilter: AssignmentScopeType | 'ALL';
  onChangeScopeFilter: (value: AssignmentScopeType | 'ALL') => void;
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex w-85 min-w-85 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-[15px] font-semibold text-slate-900">Roles & Access</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage application roles and permission access from your RBAC schema.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <RoleFilterDropdown
          value={roleScopeFilter}
          options={[
            { value: 'ALL', label: 'All scopes' },
            { value: 'GLOBAL', label: 'Global' },
            { value: 'ORGANIZATION', label: 'Organization' },
            { value: 'SERVICE_PROVIDER', label: 'Service provider' },
            { value: 'COMMUNITY', label: 'Community' },
          ]}
          onChange={(value) => onChangeScopeFilter(value as AssignmentScopeType | 'ALL')}
          ariaLabel="Filter roles by scope"
          widthClass="w-[170px]"
        />

        <Button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Plus size={10} strokeWidth={2.5} />
          </span>
          Create
        </Button>
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <EmptyState title="No roles found" description="No roles match the selected scope." />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
            <div className="space-y-2">
              {roles.map((role) => {
                const active = selectedRoleSlug === role.slug;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => onSelectRole(role.slug)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{role.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{role.slug}</p>
                      </div>

                      <RoleScopeBadge scope={role.scopeType} />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{role.activeUsers} active users</span>
                      <span>{role.isSystem ? 'System role' : 'Custom role'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </>
      )}
    </div>
  );
}