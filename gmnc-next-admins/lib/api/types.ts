import type { SessionUser } from '@/lib/validators/auth';

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type BackendLoginResponse = Record<string, unknown>;

export type LoginResult = {
  accessToken: string;
  user: SessionUser;
  raw: BackendLoginResponse;
};


// assessments 

export type AssessmentStatus = 'DRAFT' | 'COMPLETED' | 'REVIEWED';

export type AssessmentListItem = {
  id: string;
  toolCode: string;
  toolVersion: string;
  status: AssessmentStatus;
  assessedAt?: string | null;
  report?: {
    summary?: string | null;
    interpretation?: string | null;
    scores?: Record<string, unknown> | null;
    recommendations?: unknown;
  } | null;
};

export type AssessmentPatientReportResponse = {
  patientId: string;
  totalAssessments: number;
  assessments: AssessmentListItem[];
};

export type AssessmentToolItem = {
  toolName: string;
  toolCode: string;
  whoCanUseTool: string[];
  canCurrentUserUse: boolean;
};

export type AssessmentToolsResponse = {
  total: number;
  tools: AssessmentToolItem[];
};

export type AssessmentFieldOption = {
  label: string;
  value: string;
};

export type AssessmentFormField = {
  fieldCode: string;
  fieldKey?: string;
  question: string;
  expectedAnswerFormat: string;
  options?: AssessmentFieldOption[];
  required?: boolean;
  helperText?: string;
};

export type AssessmentFormSection = {
  title: string;
  description?: string;
  fields: AssessmentFormField[];
};

export type AssessmentToolFormResponse = {
  toolCode: string;
  toolName?: string;
  sections: AssessmentFormSection[];
};

export type AssessmentSubmitPayload = {
  patientId: string;
  toolCode: string;
  toolVersion?: string;
  responses: Record<string, unknown>;
  status?: 'DRAFT' | 'COMPLETED';
};

export type AssessmentSubmitResponse = {
  assessment: {
    id: string;
    patientId: string;
    providerId: string;
    toolCode: string;
    toolVersion: string;
    status: AssessmentStatus;
    assessedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  report: {
    id: string;
    summary?: string | null;
    interpretation?: string | null;
    scores: Record<string, unknown>;
    recommendations?: unknown;
  };
};