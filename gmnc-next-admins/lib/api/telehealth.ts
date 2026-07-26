import type { TelehealthRoomType } from './types';
export type { TelehealthRoomType } from './types';
import { requireApiBaseUrl } from '@/lib/env';

const API_BASE_URL = requireApiBaseUrl();

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${res.status}`;
    throw new ApiRequestError(message, res.status);
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

async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

async function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  return parseJson<T>(res);
}

export async function getTelehealthRooms(token?: string | null): Promise<{ rooms: TelehealthRoomType[]; total: number }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: TelehealthRoomType[];
  }>('/telehealth/rooms', token);

  const rooms = Array.isArray(res.data) ? res.data : [];
  return { rooms, total: rooms.length };
}

export async function getTelehealthRoom(id: string, token?: string | null): Promise<TelehealthRoomType> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: TelehealthRoomType;
  }>(`/telehealth/rooms/${id}`, token);

  return res.data;
}

export async function createTelehealthRoom(payload: {
  title?: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  attendees?: Array<{ userId?: string; email?: string | null; phone?: string | null }>;
  providerId?: string;
}, token?: string | null): Promise<TelehealthRoomType> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: TelehealthRoomType;
  }>('/telehealth/rooms', payload, token);

  return res.data;
}

export async function updateTelehealthRoom(id: string, payload: {
  title?: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}, token?: string | null): Promise<TelehealthRoomType> {
  const res = await apiPatch<{
    status: boolean;
    message?: string;
    data: TelehealthRoomType;
  }>(`/telehealth/rooms/${id}`, payload, token);

  return res.data;
}

export async function cancelTelehealthRoom(id: string, token?: string | null): Promise<void> {
  await apiDelete(`/telehealth/rooms/${id}`, token);
}

export async function joinTelehealthRoom(id: string, token?: string | null): Promise<{ joinUrl: string }> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: { joinUrl: string };
  }>(`/telehealth/rooms/${id}/join`, {}, token);

  return res.data;
}

export async function inviteToTelehealthRoom(id: string, emails: string[], token?: string | null): Promise<void> {
  await apiPost(`/telehealth/rooms/${id}/invite`, {
    attendees: emails.map((email) => ({ email })),
  }, token);
}

export async function getRoomParticipants(id: string, token?: string | null): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: {
      total: number;
      participants: Array<{
        id: string;
        role: string;
        user?: {
          id: string;
          fullName: string;
          email?: string;
          profileImage?: string;
        };
      }>;
    };
  }>(`/telehealth/rooms/${id}/participants`, token);

  const participants = (res.data?.participants || []).map((p) => ({
    id: p.id,
    name: p.user?.fullName || 'Unknown',
    email: p.user?.email || '',
    role: p.role,
  }));

  return participants;
}
