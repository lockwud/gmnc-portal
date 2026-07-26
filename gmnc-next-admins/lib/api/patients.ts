export type PatientItem = {
  id: string;
  patientId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
  email?: string;
  address?: string;
  digitalAddress?: string;
  caregiverName?: string;
  caregiver?: {
    id: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
};

export type CpPatient = {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
  email?: string;
  address?: string;
  digitalAddress?: string;
  caregiverId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getPatients(token?: string | null): Promise<{ data: PatientItem[]; status: boolean; message?: string }> {
  const response = await fetch('/api/patients', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null) as {
    status?: boolean;
    success?: boolean;
    message?: string;
    data?: PatientItem[];
  } | null;

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load patients.');
  }

  const patients = (data?.data || []).map((p: PatientItem) => ({
    ...p,
    caregiverName: p.caregiverName || p.caregiver?.user?.fullName || '',
  }));

  return {
    status: Boolean(data?.status ?? data?.success),
    message: data?.message,
    data: patients,
  };
}

export async function getCpPatients(token?: string | null): Promise<{ data: CpPatient[]; status: boolean; message?: string }> {
  const response = await fetch('/api/cp-patient', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null) as { status?: boolean; success?: boolean; message?: string; data?: CpPatient[] } | null;
  if (!response.ok) throw new Error(data?.message || 'Failed to load CP patients.');
  return { status: Boolean(data?.status ?? data?.success), message: data?.message, data: data?.data ?? [] };
}

export async function getCpPatientById(patientId: string, token?: string | null): Promise<CpPatient> {
  const patients = await getCpPatients(token);
  const patient = patients.data.find((item) => item.id === patientId || item.userId === patientId);
  if (!patient) throw new Error('Patient not found.');
  return patient;
}

export type CaregiverItem = {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  digitalAddress?: string;
  patients?: Array<{
    id: string;
    fullName: string;
  }>;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  cpPatients?: Array<{
    id: string;
    fullName: string;
  }>;
};

export async function getCaregivers(token?: string | null): Promise<{ data: CaregiverItem[]; status: boolean; message?: string }> {
  const response = await fetch('/api/caregiver', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null) as {
    status?: boolean;
    success?: boolean;
    message?: string;
    data?: CaregiverItem[] | unknown;
  } | null;

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load caregivers.');
  }

  const caregiversArray = Array.isArray(data?.data) ? data.data.map((caregiver) => ({
    ...caregiver,
    userId: caregiver.userId || caregiver.user?.id || '',
    fullName: caregiver.fullName || caregiver.user?.fullName || caregiver.nameOfGroup || 'Unknown',
    email: caregiver.email || caregiver.user?.email || caregiver.groupEmail,
    phoneNumber: caregiver.phoneNumber || caregiver.user?.phoneNumber || caregiver.groupContact,
    patients: caregiver.patients || caregiver.cpPatients,
  })) : [];
  
  return {
    status: Boolean(data?.status ?? data?.success),
    message: data?.message,
    data: caregiversArray,
  };
}
