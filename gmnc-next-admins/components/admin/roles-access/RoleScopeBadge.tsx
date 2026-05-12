'use client';

import React from 'react';
import { AssignmentScopeType } from '@/lib/api/types';
import { getScopeBadgeClass } from '@/utils/role-access';

export default function RoleScopeBadge({ scope }: { scope: AssignmentScopeType }) {
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