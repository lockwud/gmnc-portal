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
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  // Backend returns { status, data: [ ... ], pagination, message }
  const payload = response.data as any;
  const rawTickets: any[] = Array.isArray(payload?.data) ? payload.data : [];

  const tickets = rawTickets.map((t) => ({
    ticketNumber: t.ticketNumber,
    ticketId: t.id ?? t.ticketId,
    userId: t.userId,
    category: t.category,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedTo ?? null,
    messages: t.messages ?? [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    closedAt: t.closedAt ?? null,
  }));

  return {
    tickets,
    pagination: payload?.pagination,
  } as SupportTicketsListResponse;
}

export async function getTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const payload = response.data as any;
  // payload may be { status, data: { ... }, message }
  const raw = payload?.data ?? payload;

  return {
    ticketNumber: raw.ticketNumber,
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function createTicket(payload: CreateSupportTicketPayload, token?: string | null) {
  const response = await apiClient<Record<string, unknown>>(`/support/tickets`, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const payloadResp = response.data as any;
  const raw = payloadResp?.data ?? payloadResp;

  return {
    ticketNumber: raw.ticketNumber,
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function addMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const payloadResp = response.data as any;
  const raw = payloadResp?.data ?? payloadResp;

  return {
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function closeTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/close`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'PATCH',
    token: token ?? undefined,
  });

  const payloadResp = response.data as any;
  const raw = payloadResp?.data ?? payloadResp;

  return {
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function adminListTickets(filters: SupportTicketFilters = {}, token?: string | null) {
  const path = `/admin/support/tickets${buildSupportTicketQuery(filters)}`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const payload = response.data as any;
  const rawTickets: any[] = Array.isArray(payload?.data) ? payload.data : [];

  const tickets = rawTickets.map((t) => ({
    ticketNumber: t.ticketNumber,
    ticketId: t.id ?? t.ticketId,
    userId: t.userId,
    category: t.category,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedTo ?? null,
    messages: t.messages ?? [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    closedAt: t.closedAt ?? null,
  }));

  return {
    tickets,
    pagination: payload?.pagination,
  } as SupportTicketsListResponse;
}

export async function adminGetTicket(ticketId: string, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const payload = response.data as any;
  const raw = payload?.data ?? payload;

  return {
    ticketNumber: raw.ticketNumber,
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function adminUpdateTicket(ticketId: string, payload: AdminUpdateSupportTicketPayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'PATCH',
    body: payload,
    token: token ?? undefined,
  });

  const payloadResp = response.data as any;
  const raw = payloadResp?.data ?? payloadResp;

  return {
    ticketNumber: raw.ticketNumber,
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
}

export async function adminAddMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<Record<string, unknown>>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const payloadResp = response.data as any;
  const raw = payloadResp?.data ?? payloadResp;

  return {
    ticketId: raw.id ?? raw.ticketId,
    userId: raw.userId,
    category: raw.category,
    subject: raw.subject,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    assignedTo: raw.assignedTo ?? null,
    messages: raw.messages ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    closedAt: raw.closedAt ?? null,
  } as SupportTicket;
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
