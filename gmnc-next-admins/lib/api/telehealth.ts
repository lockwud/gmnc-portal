import {
  TelehealthSettingsType,
  TelehealthRoomType,
  NotificationItem,
  NotificationListResponse,
  PushTokenRegisterPayload,
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
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: NotificationItem[];
    total: number;
    page?: number;
    pageSize?: number;
  }>('/notification', token);

  return {
    notifications: res.data || [],
    total: res.total || 0,
    page: res.page,
    pageSize: res.pageSize,
  };
}

export async function getUnreadNotificationCount(token?: string | null): Promise<number> {
  const res = await apiGet<{ count: number }>('/notification/unread-count', token);
  return res.count;
}

export async function markNotificationAsRead(id: string, token?: string | null): Promise<void> {
  await apiPut(`/notification/${id}/read`, {}, token);
}

export async function markAllNotificationsAsRead(token?: string | null): Promise<void> {
  await apiPut('/notification/read-all', {}, token);
}

export async function registerPushToken(
  payload: PushTokenRegisterPayload,
  token?: string | null
): Promise<void> {
  await apiPost('/notification/push-token', payload, token);
}