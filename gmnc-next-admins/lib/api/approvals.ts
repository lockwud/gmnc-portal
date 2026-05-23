async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: 'no-store',
  });

  return parseJson<T>(res);
}

async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApprovalType = 'ENROLLMENT' | 'CARE_PLAN' | 'REFERRAL' | 'TASK';

export type ApprovalItem = {
  id: string;
  type: ApprovalType;
  referenceId: string;
  title: string;
  description?: string | null;
  status: ApprovalStatus;
  submittedBy: {
    id: string;
    fullName: string;
  };
  submittedAt: string;
  reviewedBy?: {
    id: string;
    fullName: string;
  } | null;
  reviewedAt?: string | null;
  notes?: string | null;
};

export type ApprovalSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export async function getApprovals(
  params?: { status?: ApprovalStatus; type?: ApprovalType },
  token?: string | null
): Promise<{ approvals: ApprovalItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.type) query.append('type', params.type);
  const queryString = query.toString();

  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: ApprovalItem[];
  }>(`/api/approval${queryString ? `?${queryString}` : ''}`, token);

  const approvals = Array.isArray(res.data) ? res.data : [];
  return { approvals, total: approvals.length };
}

export async function getApproval(id: string, token?: string | null): Promise<ApprovalItem> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: ApprovalItem;
  }>(`/api/approval/${id}`, token);

  return res.data;
}

export async function approveRequest(
  id: string,
  notes?: string,
  token?: string | null
): Promise<ApprovalItem> {
  const res = await apiPatch<{
    status: boolean;
    message?: string;
    data: ApprovalItem;
  }>(`/api/approval/${id}/approve`, { notes }, token);

  return res.data;
}

export async function rejectRequest(
  id: string,
  notes?: string,
  token?: string | null
): Promise<ApprovalItem> {
  const res = await apiPatch<{
    status: boolean;
    message?: string;
    data: ApprovalItem;
  }>(`/api/approval/${id}/reject`, { notes }, token);

  return res.data;
}

export async function getApprovalSummary(token?: string | null): Promise<ApprovalSummary> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: ApprovalSummary;
  }>('/api/approval/summary', token);

  return res.data;
}