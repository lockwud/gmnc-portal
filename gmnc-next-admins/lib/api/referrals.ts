import type {
  ReferralListItem,
  CreateReferralPayload,
  UpdateReferralStatusPayload,
  CreateRehabTaskFromReferralPayload,
} from './types';

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

async function refGet<T>(path: string): Promise<T> {
  const authToken = getToken();
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

async function refPost<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
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

async function refPatch<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
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

export async function getIncomingReferrals(): Promise<{
  referrals: ReferralListItem[];
  total: number;
}> {
  const res = await refGet<{
    status: boolean;
    message?: string;
    data: ReferralListItem[];
  }>('/api/assessment/referrals/incoming');

  const referrals = Array.isArray(res.data) ? res.data : [];
  return { referrals, total: referrals.length };
}

export async function getOutgoingReferrals(): Promise<{
  referrals: ReferralListItem[];
  total: number;
}> {
  const res = await refGet<{
    status: boolean;
    message?: string;
    data: ReferralListItem[];
  }>('/api/assessment/referrals/outgoing');

  const referrals = Array.isArray(res.data) ? res.data : [];
  return { referrals, total: referrals.length };
}

export async function createReferral(
  payload: CreateReferralPayload,
): Promise<{ referral: ReferralListItem }> {
  const res = await refPost<{
    status: boolean;
    message?: string;
    data: ReferralListItem;
  }>('/api/assessment/referrals', payload);

  return { referral: res.data };
}

export async function updateReferralStatus(
  referralId: string,
  payload: UpdateReferralStatusPayload,
): Promise<{ referral: ReferralListItem }> {
  const res = await refPatch<{
    status: boolean;
    message?: string;
    data: ReferralListItem;
  }>(`/api/assessment/referrals/${referralId}/status`, payload);

  return { referral: res.data };
}

export async function createRehabTaskFromReferral(
  referralId: string,
  payload: CreateRehabTaskFromReferralPayload,
): Promise<{ task: { id: string; title: string; status: string } }> {
  const res = await refPost<{
    status: boolean;
    message?: string;
    data: { id: string; title: string; status: string };
  }>(`/api/assessment/referrals/${referralId}/tasks`, payload);

  return { task: res.data };
}
