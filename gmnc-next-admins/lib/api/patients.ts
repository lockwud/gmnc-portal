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
};

export async function getPatients(token?: string | null): Promise<{ data: PatientItem[] }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: PatientItem[];
  }>('/api/patients', token);

  return res;
}