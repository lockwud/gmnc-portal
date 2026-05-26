import { apiClient } from './client';

export type PatientItem = {
  id: string;
  patientId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
  email?: string;
  address?: string;
  digitalAddress?: string;
  caregiverName?: string;
  caregiver?: {
    id: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
};

export type CpPatient = {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
  email?: string;
  address?: string;
  digitalAddress?: string;
  caregiverId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getPatients(token?: string | null): Promise<{ data: PatientItem[]; status: boolean; message?: string }> {
  const response = await fetch('/api/patients', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null) as {
    status?: boolean;
    success?: boolean;
    message?: string;
    data?: PatientItem[];
  } | null;

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load patients.');
  }

  const patients = (data?.data || []).map((p: PatientItem) => ({
    ...p,
    caregiverName: p.caregiverName || p.caregiver?.user?.fullName || '',
  }));

  return {
    status: Boolean(data?.status ?? data?.success),
    message: data?.message,
    data: patients,
  };
}

export async function getCpPatients(token?: string | null): Promise<{ data: CpPatient[]; status: boolean; message?: string }> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: CpPatient[];
  }>('/api/cp-patient', { token: token ?? undefined });

  return { status: res.data.status, message: res.data.message, data: res.data.data };
}

export async function getCpPatientById(patientId: string, token?: string | null): Promise<CpPatient> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: CpPatient;
  }>('/api/cp-patient/' + patientId, { token: token ?? undefined });

  return res.data.data;
}
