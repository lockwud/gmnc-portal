import {
  AssignmentScopeType,
  PermissionCategory,
} from '@/lib/api/types';

export const categoryLabels: Record<PermissionCategory, string> = {
  ADMIN: 'Administration',
  ASSESSMENTS: 'Assessments',
  REFERRALS: 'Referrals',
  TASKS: 'Rehab Tasks',
  APPOINTMENTS: 'Appointments',
  COMMUNITY: 'Community',
  TELEHEALTH: 'Telehealth',
  GAMES: 'Games',
  SUPPORT: 'Support',
  REPORTS: 'Reports',
};

export function getScopeBadgeClass(scope: AssignmentScopeType) {
  switch (scope) {
    case 'GLOBAL':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'SERVICE_PROVIDER':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'COMMUNITY':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-100';
    case 'ORGANIZATION':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}