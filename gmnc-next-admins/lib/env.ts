const apiBaseUrl = process.env.API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error('Missing API_BASE_URL environment variable');
}

export const env = {
  API_BASE_URL: apiBaseUrl.replace(/\/+$/, ''),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;