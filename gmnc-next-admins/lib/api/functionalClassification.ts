function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

async function apiGet<T>(path: string): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
  }
  return json as T;
}

export type FunctionalClassification = {
  id: string;
  patientId: string;
  classifier: string;
  level: number;
  assessedAt: string;
  notes?: string | null;
  assessor?: { id: string; profession?: string; user?: { fullName?: string } } | null;
  supersededById?: string | null;
  assessmentId?: string | null;
};

type Envelope<T> = {
  status: boolean;
  message?: string;
  data: T;
};

export async function listClassifications(
  patientId: string,
  classifier?: string,
): Promise<{ records: FunctionalClassification[]; total: number }> {
  const query = classifier ? `?classifier=${encodeURIComponent(classifier)}` : '';
  const res = await apiGet<Envelope<{ records: FunctionalClassification[]; total: number }>>(
    `/api/functional-classification/patient/${patientId}${query}`,
  );
  return res.data;
}

export async function getClassificationSummary(patientId: string): Promise<unknown> {
  const res = await apiGet<Envelope<unknown>>(
    `/api/functional-classification/patient/${patientId}/summary`,
  );
  return res.data;
}

export async function getClassification(id: string): Promise<FunctionalClassification> {
  const res = await apiGet<Envelope<FunctionalClassification>>(
    `/api/functional-classification/${encodeURIComponent(id)}`,
  );
  return res.data;
}

export async function createClassification(payload: {
  patientId: string;
  classifier: string;
  level: number;
  assessedAt: string;
  assessmentId?: string;
  notes?: string;
}): Promise<FunctionalClassification> {
  const res = await fetch('/api/functional-classification', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Failed to record classification');
  }
  const data = (await res.json()) as Envelope<FunctionalClassification>;
  return data.data;
}
