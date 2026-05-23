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

export type RegisterRequest = {
  fullName: string;
  email?: string | null;
  password: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  role: 'SERVICE_PROVIDER' | 'CAREGIVER' | 'ADMIN';
  dateOfBirth?: string | null;
  profileImage?: string | null;
  address?: string | null;
  digitalAddress?: string | null;
  otpChannel: 'sms' | 'email';
  verified?: boolean;
  profileCompleted?: boolean;
};

export type BackendRegisterResponse = Record<string, unknown>;

export type RegisterResult = {
  message?: string;
  otpChannel?: 'sms' | 'email';
  raw: BackendRegisterResponse;
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


//role  access management
export type AssignmentScopeType =
  | 'GLOBAL'
  | 'ORGANIZATION'
  | 'SERVICE_PROVIDER'
  | 'COMMUNITY';

export type PermissionCategory =
  | 'ADMIN'
  | 'ASSESSMENTS'
  | 'REFERRALS'
  | 'TASKS'
  | 'APPOINTMENTS'
  | 'COMMUNITY'
  | 'TELEHEALTH'
  | 'GAMES'
  | 'SUPPORT'
  | 'REPORTS';

export type WebRoleSlug =
  | 'ADMIN'
  | 'SERVICE_PROVIDER'
  | 'COMMUNITY_MODERATOR'
  | 'SUPPORT_AGENT'
  | 'AUDITOR';

export type AppRoleRecord = {
  id: string;
  slug: WebRoleSlug;
  name: string;
  description?: string;
  activeUsers: number;
  scopeType: AssignmentScopeType;
  isSystem: boolean;
};

export type PermissionRecord = {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: PermissionCategory;
};

export type UserAssignmentRecord = {
  id: string;
  userId: string; // <-- Add this line
  userName: string;
  email: string;
  roleSlug: WebRoleSlug;
  roleName: string;
  scopeType: AssignmentScopeType;
  scopeId?: string | null;
  grantedAt: string;
  expiresAt?: string | null;
  active: boolean;
};

export type RolePermissionMap = Record<string, string[]>;

// appointments

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';

export type AppointmentListItem = {
  id: string;
  patientId: string;
  providerId: string;
  appointmentDate: string;
  reasonText?: string | null;
  reasonAudio?: string | null;
  status: AppointmentStatus;
  patient?: {
    id: string;
    fullName: string;
    phoneNumber?: string;
  };
  provider?: {
    id: string;
    profession: string;
    facilityName: string;
    facilityAddress?: string;
    user?: {
      id: string;
      fullName: string;
      phoneNumber?: string;
      email?: string;
    };
  };
};

export type AppointmentListResponse = {
  appointments: AppointmentListItem[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type CreateAppointmentPayload = {
  patientId: string;
  providerId: string;
  appointmentDate: string;
  reasonText?: string;
  reasonAudio?: string | null;
  notes?: string | null;
};

export type CreateAppointmentResponse = {
  id: string;
  patientId: string;
  providerId: string;
  appointmentDate: string;
  reasonText?: string | null;
  reasonAudio?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentSettingsType = {
  id?: string;
  allowPatientBooking: boolean;
  minAppointmentNotice: number;
  defaultDuration: number;
  bufferTime: number;
  maxDailyAppointments: number;
  enableReminders: boolean;
  reminderLeadTime: number;
  requireConfirmation: boolean;
  enableWaitlist: boolean;
  workingHours?: WorkingHoursItem[];
  slotInterval?: number;
};

export type WorkingHoursItem = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export type TelehealthSettingsType = {
  id?: string;
  enableTelehealth: boolean;
  defaultProviderMinutes: number;
  maxConcurrentSessions: number;
  recordingEnabled: boolean;
  waitingRoomEnabled: boolean;
  requireApproval: boolean;
  sessionTimeout: number;
  connectTimeout: number;
};

export type TelehealthRoomStatus = 'scheduled' | 'live' | 'completed' | 'canceled';

export type TelehealthRoomType = {
  id: string;
  title?: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  status: TelehealthRoomStatus;
  maxParticipants: number;
  externalMeetingId?: string;
  joinUrl?: string;
  isRecordingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationType;
  status: NotificationStatus;
  readAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  notifications: NotificationItem[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type PushTokenRegisterPayload = {
  token: string;
  deviceType?: string;
  deviceId?: string;
};

export type ResourceType = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};