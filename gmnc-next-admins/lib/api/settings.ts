import { AppointmentSettingsType, WorkingHoursItem } from './types';

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

async function apiGet<T>(path: string): Promise<T> {
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

async function apiPut<T>(path: string, body: unknown): Promise<T> {
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

export async function getAppointmentSettings(): Promise<AppointmentSettingsType> {
  try {
    const res = await apiGet<{
      status: boolean;
      message?: string;
      data: Partial<AppointmentSettingsType>;
    }>('/api/settings/appointments');

    return { ...DEFAULT_SETTINGS, ...res.data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateAppointmentSettings(
  settings: AppointmentSettingsType
): Promise<AppointmentSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: AppointmentSettingsType;
  }>('/api/settings/appointments', settings);

  return res.data;
}