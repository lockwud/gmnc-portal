import { apiClient } from './client';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ProviderApprovalItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  facilityName: string;
  profession: string;
  licenseNumber: string;
  verificationStatus: string;
  verificationNote?: string;
  createdAt: string;
};

export type AppointmentApprovalItem = {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  appointmentDate: string;
  reasonText?: string;
  status: string;
  createdAt: string;
};

export type ReferralApprovalItem = {
  id: string;
  patientId: string;
  patientName: string;
  referringProviderId: string;
  referringProviderName: string;
  receivingProviderId: string;
  receivingProviderName: string;
  status: string;
  createdAt: string;
};

export async function getPendingProviderApprovals(token?: string | null): Promise<ProviderApprovalItem[]> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ProviderApprovalItem[];
  }>('/api/admin/providers?verificationStatus=PENDING_REVIEW', { token: token ?? undefined });

  return (res.data.data || []).filter((provider) => provider.verificationStatus === 'PENDING_REVIEW');
}

export async function approveProvider(id: string, note?: string, token?: string | null): Promise<ProviderApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ProviderApprovalItem;
  }>(`/api/admin/providers/${id}/verification`, {
    method: 'PATCH',
    body: { action: 'APPROVE', verificationNote: note, licenseStatus: 'ACTIVE' },
    token: token ?? undefined,
  });

  return res.data.data;
}

export async function rejectProvider(id: string, reason: string, token?: string | null): Promise<ProviderApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ProviderApprovalItem;
  }>(`/api/admin/providers/${id}/verification`, {
    method: 'PATCH',
    body: { action: 'REJECT', verificationNote: reason, licenseStatus: 'INACTIVE' },
    token: token ?? undefined,
  });

  return res.data.data;
}

export async function getPendingAppointmentApprovals(token?: string | null): Promise<AppointmentApprovalItem[]> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: AppointmentApprovalItem[];
  }>('/api/admin/appointments/pending', { token: token ?? undefined });

  return res.data.data || [];
}

export async function approveAppointmentRequest(id: string, notes?: string, token?: string | null): Promise<AppointmentApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: AppointmentApprovalItem;
  }>(`/api/admin/appointments/` + id + '/approve', { method: 'PATCH', body: { notes }, token: token ?? undefined });

  return res.data.data;
}

export async function rejectAppointmentRequest(id: string, reason: string, token?: string | null): Promise<AppointmentApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: AppointmentApprovalItem;
  }>(`/api/admin/appointments/` + id + '/reject', { method: 'PATCH', body: { reason }, token: token ?? undefined });

  return res.data.data;
}

export async function getPendingReferralApprovals(token?: string | null): Promise<ReferralApprovalItem[]> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ReferralApprovalItem[];
  }>('/api/admin/referrals/pending', { token: token ?? undefined });

  return res.data.data || [];
}

export async function approveReferral(id: string, token?: string | null): Promise<ReferralApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ReferralApprovalItem;
  }>(`/api/admin/referrals/` + id + '/approve', { method: 'PATCH', body: {}, token: token ?? undefined });

  return res.data.data;
}

export async function rejectReferral(id: string, reason: string, token?: string | null): Promise<ReferralApprovalItem> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: ReferralApprovalItem;
  }>(`/api/admin/referrals/` + id + '/reject', { method: 'PATCH', body: { reason }, token: token ?? undefined });

  return res.data.data;
}
