export interface AppointmentUser {
  id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
}

export interface AppointmentPatient {
  id: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AppointmentProvider {
  id: string;
  profession: string;
  facilityName: string;
  facilityAddress?: string;
  user: AppointmentUser;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  appointmentDate: Date | string;
  reasonText?: string | null;
  reasonAudio?: string | null;
  status: AppointmentStatus;
  patient: AppointmentPatient;
  provider: AppointmentProvider;
  notes?: string | null;
}

export interface AppointmentFilters {
  status: string;
  provider: string | null;
  searchTerm: string;
}
