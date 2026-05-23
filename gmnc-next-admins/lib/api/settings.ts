import { AppointmentSettingsType, TelehealthSettingsType } from './types';

export const DEFAULT_SETTINGS: AppointmentSettingsType = {
  allowPatientBooking: true,
  minAppointmentNotice: 24,
  defaultDuration: 30,
  bufferTime: 15,
  maxDailyAppointments: 20,
  enableReminders: true,
  reminderLeadTime: 2,
  requireConfirmation: false,
  enableWaitlist: true,
  slotInterval: 30,
  workingHours: [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
  ],
};

export const DEFAULT_TELEHEALTH_SETTINGS: TelehealthSettingsType = {
  enableTelehealth: true,
  defaultProviderMinutes: 30,
  maxConcurrentSessions: 5,
  recordingEnabled: false,
  waitingRoomEnabled: true,
  requireApproval: false,
  sessionTimeout: 30,
  connectTimeout: 10,
};

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

async function apiPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

export async function getAppointmentSettings(token?: string | null): Promise<AppointmentSettingsType> {
  try {
    const res = await apiGet<{
      status: boolean;
      message?: string;
      data: Partial<AppointmentSettingsType>;
    }>('/api/settings/appointments', token);

    return { ...DEFAULT_SETTINGS, ...res.data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateAppointmentSettings(
  settings: AppointmentSettingsType,
  token?: string | null
): Promise<AppointmentSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: AppointmentSettingsType;
  }>('/api/settings/appointments', settings, token);

  return res.data;
}

export async function getTelehealthSettings(token?: string | null): Promise<TelehealthSettingsType> {
  try {
    const res = await apiGet<{
      status: boolean;
      message?: string;
      data: Partial<TelehealthSettingsType>;
    }>('/api/settings/telehealth', token);

    return { ...DEFAULT_TELEHEALTH_SETTINGS, ...res.data } as TelehealthSettingsType;
  } catch {
    return DEFAULT_TELEHEALTH_SETTINGS;
  }
}

export async function updateTelehealthSettings(
  settings: TelehealthSettingsType,
  token?: string | null
): Promise<TelehealthSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: TelehealthSettingsType;
  }>('/api/settings/telehealth', settings, token);

  return res.data;
}