'use client';

import React from 'react';
import PermissionToggle from '@/components/admin/roles-access/PermissionToggle';
import { PermissionRecord } from '@/lib/api/types';

export default function PermissionGroup({
  title,
  permissions,
  selectedPermissions,
  onToggle,
}: {
  title: string;
  permissions: PermissionRecord[];
  selectedPermissions: string[];
  onToggle: (permissionCode: string, next: boolean) => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="grid grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-r border-slate-100 bg-slate-50/60 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Permission group from your RBAC capability map.
          </p>
        </div>

        <div>
          {permissions.map((permission) => {
            const checked = selectedPermissions.includes(permission.code);

            return (
              <div
                key={permission.id}
                className="grid grid-cols-[minmax(0,1fr)_140px] border-b border-slate-100 last:border-b-0"
              >
                <div className="px-4 py-4">
                  <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {permission.description || permission.code}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">{permission.code}</p>
                </div>

                <div className="flex items-center px-4 py-4">
                  <PermissionToggle
                    checked={checked}
                    onChange={(next) => onToggle(permission.code, next)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}