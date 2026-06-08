import { apiClient } from './client';
import type {
  CreateSupportTicketPayload,
  AddSupportMessagePayload,
  AdminUpdateSupportTicketPayload,
  SupportTicketsListResponse,
  SupportTicket,
  SupportTicketFilters,
  FaqListResponse,
  FaqCategoriesResponse,
  FaqArticle,
  FaqCategory,
} from './types';

export type SupportTicketQuery = SupportTicketFilters;

function buildSupportTicketQuery(filters: SupportTicketFilters = {}): string {
  const params = new URLSearchParams();

  if (typeof filters.page === 'number') {
    params.set('page', String(filters.page));
  }

  if (typeof filters.limit === 'number') {
    params.set('limit', String(filters.limit));
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listTickets(filters: SupportTicketFilters = {}, token?: string | null) {
  const path = `/support/tickets${buildSupportTicketQuery(filters)}`;
  const response = await apiClient<SupportTicketsListResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function getTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function createTicket(payload: CreateSupportTicketPayload, token?: string | null) {
  const response = await apiClient<SupportTicket>(`/support/tickets`, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });
  return response.data;
}

export async function addMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });
  return response.data;
}

export async function closeTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/close`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'PATCH',
    token: token ?? undefined,
  });
  return response.data;
}

export async function adminListTickets(filters: SupportTicketFilters = {}, token?: string | null) {
  const path = `/admin/support/tickets${buildSupportTicketQuery(filters)}`;
  const response = await apiClient<SupportTicketsListResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function adminGetTicket(ticketId: string, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function adminUpdateTicket(ticketId: string, payload: AdminUpdateSupportTicketPayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'PATCH',
    body: payload,
    token: token ?? undefined,
  });
  return response.data;
}

export async function adminAddMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<SupportTicket>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });
  return response.data;
}

export async function listFaqs(token?: string | null) {
  const response = await apiClient<FaqListResponse>(`/faq`, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function searchFaqs(query: string, token?: string | null) {
  const path = `/faq/search?q=${encodeURIComponent(query)}`;
  const response = await apiClient<FaqListResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function listFaqCategories(token?: string | null) {
  const response = await apiClient<FaqCategoriesResponse>(`/faq/categories`, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function getFaq(faqId: string, token?: string | null) {
  const path = `/faq/${encodeURIComponent(faqId)}`;
  const response = await apiClient<FaqArticle>(path, {
    method: 'GET',
    token: token ?? undefined,
  });
  return response.data;
}

export async function markFaqHelpful(faqId: string, token?: string | null) {
  const path = `/faq/${encodeURIComponent(faqId)}/helpful`;
  const response = await apiClient<FaqArticle>(path, {
    method: 'POST',
    token: token ?? undefined,
  });
  return response.data;
}
