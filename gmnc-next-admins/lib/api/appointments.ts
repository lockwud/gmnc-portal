import {
  AppointmentListResponse,
  AppointmentListItem,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
} from './types';

import { env } from '@/lib/env';

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:3001';

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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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

export async function getAppointments(token?: string | null): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/admin`, token);

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

export async function getProviderAppointments(providerId: string, token?: string | null): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/provider/${providerId}`, token);

  const appointments = Array.isArray(res.data) ? res.data : [];
  return { appointments, total: appointments.length };
}

export async function getPatientAppointments(patientId: string, token?: string | null): Promise<{ appointments: AppointmentListItem[]; total: number }> {
  const res = await apGet<{
    status: boolean;
    message?: string;
    data: AppointmentListItem[];
  }>(`/api/appointment/patient/${patientId}`, token);

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
  const res = await apPatch<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment/approve', { appointmentId: id, ...payload }, token);

  return res.data;
}

export async function rescheduleAppointment(id: string, payload: { appointmentDate: string; notes?: string }, token?: string | null): Promise<CreateAppointmentResponse> {
  const res = await apPatch<{
    status: boolean;
    message?: string;
    data: CreateAppointmentResponse;
  }>('/api/appointment/reschedule', { appointmentId: id, ...payload }, token);

  return res.data;
}