import {
  AppointmentListItem,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
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

async function apGet<T>(path: string, token?: string | null): Promise<T> {
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

async function apPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

async function apPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

async function apPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

type AppointmentScope = 'admin' | 'provider' | 'caregiver';

export async function getAppointments(
  token?: string | null,
  scope: AppointmentScope = 'admin',
): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    success?: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/${scope}`, token);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function createAppointment(payload: CreateAppointmentPayload, token?: string | null): Promise<CreateAppointmentResponse> {
  const res = await apPost<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment', payload, token);

  return res.data;
}

export async function getProviderAppointments(_providerId: string, token?: string | null): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/provider`, token);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function getPatientAppointments(_patientId: string, token?: string | null): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/caregiver`, token);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function getAppointment(id: string, token?: string | null): Promise<AppointmentListItem> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem;
  }>(`/api/appointment/${id}`, token);

  return res.data;
}

export async function updateAppointment(id: string, payload: Partial<CreateAppointmentPayload>, token?: string | null): Promise<CreateAppointmentResponse> {
  const res = await apPut<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>(`/api/appointment/${id}`, payload, token);

  return res.data;
}

export async function approveAppointment(id: string, payload: { status: string; notes?: string }, token?: string | null): Promise<CreateAppointmentResponse> {
  void payload;
  const res = await apPatch<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment/approve', { appointmentId: id }, token);

  return res.data;
}

export async function rescheduleAppointment(id: string, payload: { appointmentDate: string; notes?: string }, token?: string | null): Promise<CreateAppointmentResponse> {
  const date = new Date(payload.appointmentDate);
  const newDate = date.toISOString().slice(0, 10);
  const newTime = date.toTimeString().slice(0, 5);
  const res = await apPatch<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment/reschedule', { appointmentId: id, newDate, newTime }, token);

  return res.data;
}

export type ProviderAvailabilitySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export async function getProviderAvailability(
  providerId: string,
  date: string,
  token?: string | null,
): Promise<{ slots: ProviderAvailabilitySlot[] }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: { slots?: ProviderAvailabilitySlot[] };
  }>(`/api/appointment/provider-availability?providerId=${encodeURIComponent(providerId)}&date=${encodeURIComponent(date)}`, token);

  return { slots: Array.isArray(res.data?.slots) ? res.data.slots : [] };
}
