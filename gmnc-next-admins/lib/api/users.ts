async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: 'no-store',
  });

  return parseJson<T>(res);
}

export type UserItem = {
  id: string;
  fullName: string;
  userType?: string;
  profession?: string;
  facilityName?: string;
};

export async function getAdminUsers(token?: string | null): Promise<{ data: UserItem[] }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: { data: UserItem[] };
  }>('/api/admin/users', token);

  return res.data;
}