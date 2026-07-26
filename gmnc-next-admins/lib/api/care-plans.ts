import { apiClient } from './client';

export type CarePlanStatus = 'ACTIVE' | 'COMPLETED' | 'SUPERSEDED';

export type CarePlan = {
  id: string;
  patientId: string;
  assessmentId: string;
  primaryProviderId: string;
  reviewDate?: string | null;
  status: CarePlanStatus;
  goals: unknown[];
  interventions: unknown[];
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    fullName: string;
  };
  provider?: {
    id: string;
    profession: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
  signatures?: Array<Record<string, unknown>>;
};

export type CarePlanListResponse = {
  data: CarePlan[];
};

export type CarePlanResponse = {
  data: CarePlan;
};

type RawCarePlan = CarePlan & {
  primaryProvider?: CarePlan['provider'];
};

function normalizeCarePlan(plan: RawCarePlan): CarePlan {
  return {
    ...plan,
    provider: plan.provider ?? plan.primaryProvider,
  };
}

export async function getCarePlan(patientId: string, token?: string | null) {
  const response = await apiClient<CarePlanResponse>(`/care-plan?patientId=${encodeURIComponent(patientId)}`, {
    method: 'GET',
    token: token ?? undefined,
  });

  return normalizeCarePlan(response.data.data as RawCarePlan);
}

export async function listCarePlans(patientId?: string, token?: string | null) {
  const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await apiClient<CarePlanListResponse>(`/care-plan/list${qs}`, {
    method: 'GET',
    token: token ?? undefined,
  });

  return response.data.data.map((plan) => normalizeCarePlan(plan as RawCarePlan));
}

export async function generateCarePlan(assessmentId: string, token?: string | null) {
  const response = await apiClient<CarePlanResponse>(`/care-plan/generate/${encodeURIComponent(assessmentId)}`, {
    method: 'POST',
    token: token ?? undefined,
  });

  return normalizeCarePlan(response.data.data as RawCarePlan);
}

export async function updateCarePlanStatus(carePlanId: string, status: CarePlanStatus, token?: string | null) {
  const response = await apiClient<CarePlanResponse>(`/care-plan/${encodeURIComponent(carePlanId)}/status`, {
    method: 'PATCH',
    body: { status },
    token: token ?? undefined,
  });

  return normalizeCarePlan(response.data.data as RawCarePlan);
}

export async function updateCarePlanContent(carePlanId: string, payload: Record<string, unknown>, token?: string | null) {
  const response = await apiClient<CarePlanResponse>(`/care-plan/${encodeURIComponent(carePlanId)}/content`, {
    method: 'PATCH',
    body: payload,
    token: token ?? undefined,
  });

  return response.data.data;
}
