import {
  AppointmentListResponse,
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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  return parseJson<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function getAppointments(): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/admin`);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<CreateAppointmentResponse> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment', payload);

  return res.data;
}

export async function getProviderAppointments(providerId: string): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/provider/${providerId}`);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function getPatientAppointments(patientId: string): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/patient/${patientId}`);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function getAppointment(id: string): Promise<AppointmentListItem> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem;
  }>(`/api/appointment/${id}`);

  return res.data;
}

export async function updateAppointment(id: string, payload: Partial<CreateAppointmentPayload>): Promise<CreateAppointmentResponse> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>(`/api/appointment/${id}`, payload);

  return res.data;
}