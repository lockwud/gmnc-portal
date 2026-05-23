const apiBaseUrl = process.env.API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const env = {
  API_BASE_URL: apiBaseUrl ? apiBaseUrl.replace(/\/+$/, '') : '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;