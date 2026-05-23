import { apiClient } from './client';
import type { ResourceType } from './types';

export async function getResources(token: string): Promise<ResourceType[]> {
  const res = await apiClient<{ data: ResourceType[] }>('/resource', { token });
  return res.data.data;
}

export async function getResource(id: string, token: string): Promise<ResourceType> {
  const res = await apiClient<{ data: ResourceType }>('/resource/' + id, { token });
  return res.data.data;
}

export async function createResource(
  formData: FormData,
  token: string
): Promise<ResourceType> {
  const res = await apiClient<{ data: ResourceType }>('/resource', {
    method: 'POST',
    body: formData,
    token,
    skipJsonStringify: true,
  });
  return res.data.data;
}

export async function updateResource(
  id: string,
  formData: FormData,
  token: string
): Promise<ResourceType> {
  const res = await apiClient<{ data: ResourceType }>('/resource/' + id, {
    method: 'PUT',
    body: formData,
    token,
    skipJsonStringify: true,
  });
  return res.data.data;
}

export async function deleteResource(id: string, token: string): Promise<void> {
  await apiClient('/resource/' + id, { method: 'DELETE', token });
}