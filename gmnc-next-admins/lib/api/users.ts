import { apiGet } from './assessments';

export type UserItem = {
  id: string;
  fullName: string;
  userType?: string;
  profession?: string;
  facilityName?: string;
};

export async function getAdminUsers(): Promise<{ data: UserItem[] }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: { data: UserItem[] };
  }>('/api/admin/users');

  return res.data;
}