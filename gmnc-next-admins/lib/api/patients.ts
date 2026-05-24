import { apiGet } from './appointments';

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

export async function getPatients(token?: string | null): Promise<{ data: PatientItem[]; status: boolean; message?: string }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: PatientItem[];
  }>('/api/patients', token);

  const patients = (res.data || []).map((p) => ({
    ...p,
    caregiverName: p.caregiverName || p.caregiver?.user?.fullName || '',
  }));

  return { ...res, data: patients };
}