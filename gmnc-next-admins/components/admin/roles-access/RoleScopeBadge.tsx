'use client';

import React from 'react';
import { AssignmentScopeType } from '@/lib/api/types';
import { getScopeBadgeClass } from '@/utils/role-access';

export default function RoleScopeBadge({ scope }: { scope: AssignmentScopeType | undefined }) {
  if (!scope) {
    return <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-500">Global</span>;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getScopeBadgeClass(
        scope
      )}`}
    >
      {scope.replace('_', ' ')}
    </span>
  );
}