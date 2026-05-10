import { env } from '@/lib/env';

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: HeadersInit;
  cache?: RequestCache;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export type ApiClientResponse<T> = {
  data: T;
  headers: Headers;
  status: number;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiClientResponse<T>> {
  const {
    method = 'GET',
    body,
    token,
    headers,
    cache = 'no-store',
    timeoutMs = 15000,
  } = options;

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (networkError) {
    const isTimeout =
      networkError instanceof DOMException && networkError.name === 'TimeoutError';
    throw new ApiError(
      isTimeout
        ? 'Request timed out. Please check your connection and try again.'
        : 'Unable to reach the server. Please check your connection and try again.',
      503,
      networkError,
    );
  }

  const contentType = response.headers.get('content-type');
  let payload: unknown = null;

  if (contentType?.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message?: unknown }).message ?? 'Request failed')
        : typeof payload === 'string' && payload
          ? payload
          : 'Request failed',
      response.status,
      payload,
    );
  }

  return {
    data: payload as T,
    headers: response.headers,
    status: response.status,
  };
}