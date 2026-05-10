export function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return '—';
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return `${age} yrs`;
}

export function statusPillClass(status?: string | null) {
  switch (status) {
    case 'COMPLETED':
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'REVIEWED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'DRAFT':
    case 'PENDING':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    case 'DECLINED':
      return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

export function draftStorageKey(patientId: string, toolCode: string) {
  return `assessment-draft:${patientId}:${toolCode}`;
}