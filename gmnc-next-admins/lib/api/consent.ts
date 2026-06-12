import { apiClient } from './client';
import type { ConsentRecord, ConsentType, ConsentMethod } from './types';

export async function createConsent(payload: {
  patientId: string;
  consentType: ConsentType;
  scope?: string;
  documentId?: string;
  method?: ConsentMethod;
}, token?: string | null) {
  const response = await apiClient<{ status: number; data: ConsentRecord }>('/consent', {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  return response.data;
}

export async function revokeConsent(consentId: string, token?: string | null) {
  const response = await apiClient<{ status: number; data: ConsentRecord }>(`/consent/${encodeURIComponent(consentId)}/revoke`, {
    method: 'PATCH',
    token: token ?? undefined,
  });

  return response.data;
}

export async function listConsents(patientId: string, token?: string | null) {
  const response = await apiClient<{ status: number; data: ConsentRecord[] }>(`/consent?patientId=${encodeURIComponent(patientId)}`, {
    method: 'GET',
    token: token ?? undefined,
  });

  return response.data.data;
}
