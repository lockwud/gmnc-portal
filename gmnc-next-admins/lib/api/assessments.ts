import {
  AssessmentPatientReportResponse,
  AssessmentReportResponse,
  AssessmentSubmitPayload,
  AssessmentSubmitResponse,
  AssessmentToolFormResponse,
  AssessmentToolsResponse,
} from './types';

let assessmentToolsPromise: Promise<AssessmentToolsResponse> | null = null;
const assessmentToolFormPromises = new Map<string, Promise<AssessmentToolFormResponse>>();

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

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

export async function apiGet<T>(path: string): Promise<T> {
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

  return parseJson<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function getAssessmentTools(): Promise<AssessmentToolsResponse> {
  if (!assessmentToolsPromise) {
    assessmentToolsPromise = apiGet<{
      status: boolean;
      message?: string;
      data: AssessmentToolsResponse;
    }>('/api/assessment/tools').then((res) => res.data);
  }

  return assessmentToolsPromise;
}

export async function getAssessmentToolForm(toolCode: string): Promise<AssessmentToolFormResponse> {
  const normalizedToolCode = toolCode.trim();

  if (!assessmentToolFormPromises.has(normalizedToolCode)) {
    assessmentToolFormPromises.set(
      normalizedToolCode,
      apiGet<{
        status: boolean;
        message?: string;
        data: AssessmentToolFormResponse;
      }>(`/api/assessment/tools/${normalizedToolCode}/form`).then((res) => res.data),
    );
  }

  return assessmentToolFormPromises.get(normalizedToolCode)!;
}

export function clearAssessmentToolFormCache(toolCode?: string) {
  if (!toolCode) {
    assessmentToolFormPromises.clear();
    return;
  }

  const key = toolCode.trim();
  if (assessmentToolFormPromises.has(key)) {
    assessmentToolFormPromises.delete(key);
  }
}

export async function warmAssessmentToolForms(toolCodes: string[]): Promise<void> {
  await Promise.allSettled(
    toolCodes
      .map((toolCode) => toolCode.trim())
      .filter(Boolean)
      .map((toolCode) => getAssessmentToolForm(toolCode)),
  );
}

export async function getPatientAssessments(patientId: string): Promise<AssessmentPatientReportResponse> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentPatientReportResponse;
  }>(`/api/assessment/patient/${patientId}/reports`);

  return res.data;
}

export async function getAssessmentReport(assessmentId: string): Promise<AssessmentReportResponse> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentReportResponse;
  }>(`/api/assessment/${assessmentId}/report`);

  return res.data;
}

export async function submitAssessment(payload: AssessmentSubmitPayload): Promise<AssessmentSubmitResponse> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: AssessmentSubmitResponse;
  }>('/api/assessment/submit', payload);

  return res.data;
}

export async function getAssessmentById(assessmentId: string): Promise<{ id: string; patientId: string; providerId: string; toolCode: string; status: string; assessedAt?: string }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: { id: string; patientId: string; providerId: string; toolCode: string; status: string; assessedAt?: string };
  }>(`/api/assessment/${assessmentId}`);

  return res.data;
}

export type SuggestedClassification = {
  classifierType: string;
  suggestedLevel: string;
  confidence: number;
  source: string;
};

export function getSuggestedClassification(reportScores: Record<string, unknown>, toolCode: string): SuggestedClassification | null {
  const scores = reportScores ?? {};
  const code = String(toolCode || '').toUpperCase();

  if (code === 'GMFM_88') {
    const total = typeof scores.total === 'number' ? scores.total : (typeof scores.percentage === 'number' ? scores.percentage : null);
    if (total == null) return null;

    let level = 'LEVEL_I';
    if (total < 20) level = 'LEVEL_V';
    else if (total < 35) level = 'LEVEL_IV';
    else if (total < 55) level = 'LEVEL_III';
    else if (total < 75) level = 'LEVEL_II';

    return {
      classifierType: 'GMFCS',
      suggestedLevel: level,
      confidence: total > 0 ? Math.min(total, 100) : 0,
      source: 'GMFM-88 total score heuristic',
    };
  }

  if (code === 'OT_CP_CLINICAL_ASSESSMENT' || code === 'OT_CP_CLINICAL') {
    const adlKey = Object.keys(scores).find((key) => /adl|self.?care|feeding|dressing/i.test(key));
    if (!adlKey) return null;
    const adlValue = scores[adlKey];
    if (typeof adlValue !== 'string') return null;

    let level = 'LEVEL_I';
    if (/unable|unable/i.test(adlValue)) level = 'LEVEL_V';
    else if (/need adaptations/i.test(adlValue)) level = 'LEVEL_III';
    else if (/difficulties|with difficulties/i.test(adlValue)) level = 'LEVEL_II';

    return {
      classifierType: 'GMFCS',
      suggestedLevel: level,
      confidence: 0.65,
      source: `OT ADL section heuristic (${adlKey})`,
    };
  }

  return null;
}
