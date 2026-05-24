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

function getClientToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

export async function apiGet<T>(path: string): Promise<T> {
  const authToken = getClientToken();
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
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function getAssessmentTools() {
  if (!assessmentToolsPromise) {
    assessmentToolsPromise = apiGet<{
      status: boolean;
      message?: string;
      data: AssessmentToolsResponse;
    }>('/api/assessment/tools').then((res) => res.data);
  }

  return assessmentToolsPromise;
}

export async function getAssessmentToolForm(toolCode: string) {
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

export async function warmAssessmentToolForms(toolCodes: string[]) {
  await Promise.allSettled(
    toolCodes
      .map((toolCode) => toolCode.trim())
      .filter(Boolean)
      .map((toolCode) => getAssessmentToolForm(toolCode)),
  );
}

export async function getPatientAssessments(patientId: string) {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentPatientReportResponse;
  }>(`/api/assessment/patient/${patientId}/reports`);

  return res.data;
}

export async function getAssessmentReport(assessmentId: string) {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentReportResponse;
  }>(`/api/assessment/${assessmentId}/report`);

  return res.data;
}

export async function submitAssessment(payload: AssessmentSubmitPayload) {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: AssessmentSubmitResponse;
  }>('/api/assessment/submit', payload);

  return res.data;
}