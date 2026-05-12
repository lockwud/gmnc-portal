'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import RowActions from '@/components/ui/RowActions';
import PermissionGroup from '@/components/admin/roles-access/PermissionGroup';
import RoleScopeBadge from '@/components/admin/roles-access/RoleScopeBadge';
import { AppRoleRecord, PermissionRecord } from '@/lib/api/types';
import { categoryLabels } from '@/utils/role-access';

export default function RolePermissionsPanel({
  selectedRole,
  groupedPermissions,
  selectedPermissions,
  onTogglePermission,
  onReset,
  onSave,
  isLoading,
}: {
  selectedRole: AppRoleRecord;
  groupedPermissions: Record<string, PermissionRecord[]>;
  selectedPermissions: string[];
  onTogglePermission: (permissionCode: string, next: boolean) => void;
  onReset: () => void;
  onSave: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{selectedRole.name}</h2>
          <p className="mt-1 text-xs text-slate-500">{selectedRole.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <RoleScopeBadge scope={selectedRole.scopeType} />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              onClick={onReset}
              disabled={isLoading}
            >
              Reset changes
            </Button>
            <Button
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              onClick={onSave}
              disabled={isLoading}
            >
              Save changes
            </Button>
            <Button
              className="rounded-full px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600"
              onClick={() => {
                // Toggle all permissions - get all permission codes and toggle them
                const allPermissions = Object.values(groupedPermissions).flat();
                const allCodes = allPermissions.map(p => p.code);
                const allSelected = allCodes.every(code => selectedPermissions.includes(code));
                
                // If all are selected, deselect all; otherwise select all
                allCodes.forEach(code => {
                  onTogglePermission(code, !allSelected);
                });
              }}
              disabled={isLoading}
            >
              {Object.values(groupedPermissions).flat().every(p => 
                selectedPermissions.includes(p.code)
              ) ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div onClick={(event) => event.stopPropagation()}>
            <RowActions
              onEdit={() => console.log('Edit role', selectedRole.slug)}
              onDelete={() => console.log('Delete role', selectedRole.slug)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-0 flex-1 items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="min-h-0 h-full overflow-auto px-4 py-4">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[220px_minmax(0,1fr)_140px] border-b border-slate-200 bg-slate-50 text-slate-600">
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Module
              </div>
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Permission
              </div>
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Access
              </div>
            </div>

            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <PermissionGroup
                key={category}
                title={categoryLabels[category as PermissionRecord['category']] ?? category}
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                onToggle={onTogglePermission}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}