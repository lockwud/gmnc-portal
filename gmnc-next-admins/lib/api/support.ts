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

type SupportTicketRaw = {
  ticketNumber?: string | null;
  id?: string;
  ticketId?: string;
  userId?: string;
  category?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  messages?: Array<Record<string, unknown>> | null;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  message?: string;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
};

type SupportApiResponse = { status: number; message?: string; data?: unknown };

function normalizeSupportMessage(message: Record<string, unknown>): SupportTicket['messages'][number] {
  const sender = typeof message.sender === 'object' && message.sender !== null
    ? {
        id: typeof message.sender.id === 'string' ? message.sender.id : '',
        fullName: typeof message.sender.fullName === 'string' ? message.sender.fullName : null,
        userType: typeof message.sender.userType === 'string' ? message.sender.userType : null,
        profileImage: typeof message.sender.profileImage === 'string' ? message.sender.profileImage : null,
      }
    : undefined;

  return {
    messageId: typeof message.messageId === 'string' ? message.messageId : typeof message.id === 'string' ? message.id : '',
    ticketId: typeof message.ticketId === 'string' ? message.ticketId : '',
    senderId: typeof message.senderId === 'string' ? message.senderId : '',
    senderRole: message.senderRole === 'SUPPORT' ? 'SUPPORT' : 'USER',
    content: typeof message.content === 'string' ? message.content : '',
    createdAt: typeof message.createdAt === 'string' ? message.createdAt : '',
    updatedAt: typeof message.updatedAt === 'string' ? message.updatedAt : undefined,
    sender,
  };
}

function normalizeSupportTicket(raw: SupportTicketRaw | undefined): SupportTicket {
  if (!raw) {
    return {
      ticketId: '',
      userId: '',
      category: 'OTHER',
      subject: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      messages: [],
      createdAt: '',
      updatedAt: '',
    };
  }

  const messages = Array.isArray(raw.messages)
    ? raw.messages.map((item) => normalizeSupportMessage(item))
    : [];

  return {
    ticketNumber: raw.ticketNumber ?? undefined,
    ticketId: typeof raw.id === 'string' ? raw.id : typeof raw.ticketId === 'string' ? raw.ticketId : '',
    userId: typeof raw.userId === 'string' ? raw.userId : '',
    category: typeof raw.category === 'string' ? raw.category : 'OTHER',
    subject: typeof raw.subject === 'string' ? raw.subject : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    status: typeof raw.status === 'string' ? raw.status : 'OPEN',
    priority: typeof raw.priority === 'string' ? raw.priority : 'MEDIUM',
    assignedTo: raw.assignedTo ?? null,
    messages,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    closedAt: raw.closedAt ?? null,
  };
}

export async function listTickets(filters: SupportTicketFilters = {}, token?: string | null) {
  const path = `/support/tickets${buildSupportTicketQuery(filters)}`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null ? response.data : {};
  const tickets = Array.isArray(raw.data)
    ? (raw.data as SupportTicketRaw[]).map((ticket) => normalizeSupportTicket(ticket))
    : [];

  return {
    tickets,
    pagination: raw.pagination,
  } as SupportTicketsListResponse;
}

export async function getTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function createTicket(payload: CreateSupportTicketPayload, token?: string | null) {
  const response = await apiClient<SupportApiResponse>(`/support/tickets`, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function addMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function closeTicket(ticketId: string, token?: string | null) {
  const path = `/support/tickets/${encodeURIComponent(ticketId)}/close`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'PATCH',
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function adminListTickets(filters: SupportTicketFilters = {}, token?: string | null) {
  const path = `/admin/support/tickets${buildSupportTicketQuery(filters)}`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null ? response.data : {};
  const tickets = Array.isArray(raw.data)
    ? (raw.data as SupportTicketRaw[]).map((ticket) => normalizeSupportTicket(ticket))
    : [];

  return {
    tickets,
    pagination: raw.pagination,
  } as SupportTicketsListResponse;
}

export async function adminGetTicket(ticketId: string, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'GET',
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function adminUpdateTicket(ticketId: string, payload: AdminUpdateSupportTicketPayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'PATCH',
    body: payload,
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
}

export async function adminAddMessage(ticketId: string, payload: AddSupportMessagePayload, token?: string | null) {
  const path = `/admin/support/tickets/${encodeURIComponent(ticketId)}/messages`;
  const response = await apiClient<SupportApiResponse>(path, {
    method: 'POST',
    body: payload,
    token: token ?? undefined,
  });

  const raw = typeof response.data === 'object' && response.data !== null
    ? ((response.data as SupportApiResponse).data ?? response.data)
    : null;

  return normalizeSupportTicket(raw as SupportTicketRaw);
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
