import type {
  TelehealthSettingsType,
  TelehealthRoomType,
  NotificationItem,
  NotificationListResponse,
} from './types';
import { env } from '@/lib/env';

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:3001';

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

async function apiPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

async function localApiGet<T>(path: string, token?: string | null): Promise<T> {
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

async function localApiPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

export async function getTelehealthSettings(token?: string | null): Promise<TelehealthSettingsType> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: TelehealthSettingsType;
  }>('/settings/telehealth', token);

  return res.data;
}

export async function updateTelehealthSettings(
  settings: Partial<TelehealthSettingsType>,
  token?: string | null
): Promise<TelehealthSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: TelehealthSettingsType;
  }>('/settings/telehealth', settings, token);

  return res.data;
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
}, token?: string | null): Promise<TelehealthRoomType> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: TelehealthRoomType;
  }>('/telehealth/rooms', payload, token);

  return res.data;
}

export async function cancelTelehealthRoom(id: string, token?: string | null): Promise<void> {
  await apiDelete(`/telehealth/rooms/${id}`, token);
}

export async function getNotifications(token?: string | null): Promise<NotificationListResponse> {
  const res = await localApiGet<{
    status: boolean;
    message?: string;
    data: NotificationItem[] | {
      data?: NotificationItem[];
      pagination?: {
        total?: number;
        page?: number;
        limit?: number;
      };
    };
    total?: number;
    page?: number;
    pageSize?: number;
  }>('/api/notification?limit=50', token);

  const nestedData = typeof res.data === 'object' && !Array.isArray(res.data)
    ? res.data
    : null;
  const notifications = Array.isArray(res.data)
    ? res.data
    : nestedData?.data ?? [];

  return {
    notifications,
    total: res.total || nestedData?.pagination?.total || notifications.length,
    page: res.page || nestedData?.pagination?.page,
    pageSize: res.pageSize || nestedData?.pagination?.limit,
  };
}

export async function getUnreadNotificationCount(token?: string | null): Promise<number> {
  const res = await localApiGet<{ status: boolean; data: { count?: number }; message?: string }>('/api/notification/unread-count', token);
  return typeof res.data?.count === 'number' ? res.data.count : 0;
}

export async function markNotificationAsRead(id: string, token?: string | null): Promise<void> {
  await localApiPut(`/api/notification/${id}/read`, {}, token);
}

export async function markAllNotificationsAsRead(token?: string | null): Promise<void> {
  await localApiPut('/api/notification/read-all', {}, token);
}
