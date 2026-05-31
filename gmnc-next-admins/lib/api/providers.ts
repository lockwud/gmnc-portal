import { env } from '@/lib/env';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

async function apiGet<T>(path: string, token?: string | null): Promise<T> {
   const authToken = token ?? getToken();
   const res = await fetch(`/api/admin/providers${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
   const authToken = token ?? getToken();
   const res = await fetch(`/api/admin/providers${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

export type ProviderVerificationStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type ProviderVerificationAction = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUSPEND';

export type ProviderDocument = {
  url: string;
  name?: string;
  type?: string;
};

export type Provider = {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseImage: string | null;
  licenseExpiry: string;
  licenseIssuedBy: string;
  licenseIssuedDate: string;
  licenseStatus: string;
  facilityType: string;
  facilityName: string;
  facilityAddress: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
  profession: string;
  licenseType: string;
  licensePin: string;
  verificationStatus: ProviderVerificationStatus;
  verificationNote: string;
  verifiedAt: string;
  verifiedBy: string;
  documents?: ProviderDocument[];
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
    profileCompleted: boolean;
    verified: boolean;
    gender: string;
    address: string;
    digitalAddress: string;
    dateOfBirth: string;
    accountStatus: string;
    userType: string;
  };
};

type ProvidersListApiResponse = {
  status: boolean;
  message?: string;
  data: Provider[];
};

type ProviderApiResponse = {
  status: boolean;
  message?: string;
  data: Provider;
};

export async function getProvidersWaitingVerification(token?: string): Promise<Provider[]> {
   const res = await apiGet<ProvidersListApiResponse>('', token);
   return res.data || [];
 }

 export async function getProviderById(id: string, token?: string): Promise<Provider> {
   const res = await apiGet<ProviderApiResponse>(`/${id}`, token);
   return Array.isArray(res.data) ? res.data[0] : res.data;
 }

type VerificationActionBody = {
  action: ProviderVerificationAction;
  verificationNote?: string;
  licenseStatus?: string;
};

export async function verifyProvider(
  id: string,
  action: ProviderVerificationAction,
  notes?: string,
  licenseStatus?: string,
  token?: string
): Promise<Provider> {
  // Only include verificationNote if notes is a non-empty string
  const payload: VerificationActionBody = {
    action,
    licenseStatus,
  };
  if (notes && notes.trim() !== '') {
    payload.verificationNote = notes;
  }
  const res = await apiPatch<ProviderApiResponse>(`/${id}/verification`, payload, token);
  return res.data;
}