const apiBaseUrl = process.env.API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const env = {
  API_BASE_URL: apiBaseUrl ? apiBaseUrl.replace(/\/+$/, '') : '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '',
} as const;

export function requireApiBaseUrl() {
  if (!env.API_BASE_URL) {
    throw new Error('API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be configured.');
  }

  return env.API_BASE_URL;
}
