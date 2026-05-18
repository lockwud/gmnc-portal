import { Appointment, AppointmentStatus } from '@/components/provider/appointments/types';

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

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

/**
 * GET /schedule-appointment/provider
 * Returns all appointments visible to the currently authenticated user.
 * (Admins will see the provider-scoped list; use /caregiver for caregiver view)
 */
export async function getAppointments(): Promise<Appointment[]> {
  const res = await apiGet<{
    success: boolean;
    data: Appointment[] | { appointments?: Appointment[] };
  }>('/api/appointment');
  
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'appointments' in raw) {
    return (raw as { appointments: Appointment[] }).appointments || [];
  }
  return [];
}

/**
 * POST /schedule-appointment
 * Create a new appointment for a patient with a service provider.
 */
export async function createAppointment(payload: {
  patientId: string;
  providerId: string;
  appointmentDate: string;
  reasonText?: string;
}): Promise<Appointment> {
  const res = await apiPost<{
    success: boolean;
    data: Appointment;
  }>('/api/appointment', payload);
  return res.data;
}

/**
 * PATCH /schedule-appointment/approve
 * Approve an appointment for the authenticated service provider.
 */
export async function approveAppointment(appointmentId: string): Promise<Appointment> {
  const res = await apiPatch<{
    success: boolean;
    data: Appointment;
  }>('/api/appointment/approve', { appointmentId });
  return res.data;
}

/**
 * PATCH /schedule-appointment/reschedule
 * Reschedule an appointment for the authenticated service provider.
 */
export async function rescheduleAppointment(payload: {
  appointmentId: string;
  newDate: string;
}): Promise<Appointment> {
  const res = await apiPatch<{
    success: boolean;
    data: Appointment;
  }>('/api/appointment/reschedule', payload);
  return res.data;
}

/**
 * GET /schedule-appointment/available-providers
 * Get providers available at a specific date and time.
 */
export async function getAvailableProviders(params: {
  date: string;
  time: string;
}): Promise<unknown[]> {
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet<{
    success: boolean;
    data: unknown[];
  }>(`/api/appointment/available-providers?${qs}`);
  return res.data || [];
}

/** @deprecated — kept for backwards compat, use approveAppointment / rescheduleAppointment instead */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  if (status === 'APPROVED') return approveAppointment(id);
  const res = await apiPatch<{
    success: boolean;
    data: Appointment;
  }>(`/api/appointment/${id}`, { status });
  return res.data;
}
