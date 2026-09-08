import type { SessionUser } from '@/lib/validators/auth';

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type BackendLoginResponse = Record<string, unknown>;

export type TermsStatusPayload = {
  reacceptanceRequired: boolean;
  acceptedTermsVersion?: string | null;
  acceptedPrivacyPolicyVersion?: string | null;
  liveTermsVersion?: string;
  livePrivacyPolicyVersion?: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken?: string | null;
  userId?: string | null;
  accessTokenExpiresIn?: string | null;
  refreshTokenExpiresInDays?: number | null;
  terms?: TermsStatusPayload | null;
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

export type AssessmentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'COMPLETED' | 'REVIEWED' | 'REVIEWED_NEEDS_REVISION' | 'APPROVED';

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';

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

export type AssessmentReportResponse = {
  assessmentId: string;
  report: {
    summary?: string | null;
    interpretation?: string | null;
    scores?: Record<string, unknown> | null;
    recommendations?: unknown;
  };
};

export type AssessmentToolItem = {
  toolName: string;
  toolCode: string;
  version?: number;
  status?: string;
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
  score?: number;
};

export type AssessmentFormField = {
  fieldCode?: string;
  fieldKey: string;
  question: string;
  helpText?: string | null;
  fieldType?: string;
  expectedAnswerFormat: string;
  options?: AssessmentFieldOption[] | null;
  required?: boolean;
  helperText?: string;
};

export type AssessmentFormSection = {
  title?: string;
  sectionCode?: string;
  sectionName?: string;
  sectionDescription?: string | null;
  description?: string;
  fields: AssessmentFormField[];
};

export type AssessmentClassificationContext = {
  applicableScales: string[];
  onFile: Array<{ id: string; classifier: string; level: number; assessedAt: string }> | null;
  missingScales: string[];
  staleScales: string[];
  isStale: boolean;
  classificationRecommended: boolean;
};

export type AssessmentToolFormResponse = {
  toolCode: string;
  toolName?: string;
  version?: string | number;
  definitionVersion?: number;
  sections: AssessmentFormSection[];
  classification?: AssessmentClassificationContext;
  dimensions?: Array<{
    code: string;
    name: string;
    start: number;
    end: number;
  }>;
};

export type AssessmentSubmitPayload = {
  patientId: string;
  toolCode: string;
  toolVersion?: string;
  functionalClassificationId?: string;
  responses: Record<string, unknown>;
  status?: 'DRAFT' | 'COMPLETED';
  isRegularPerformance?: boolean;
  clinicalNotesComment?: string;
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
  classificationAttached?: boolean;
  classificationRecommended?: boolean;
};

// games

export type GameSource = 'UPLOADED' | 'YOUTUBE' | 'EXTERNAL';

export type GameResource = {
  id: string;
  title: string;
  description?: string | null;
  source: GameSource;
  externalProvider?: string | null;
  externalId?: string | null;
  files?: string[];
  thumbnail?: string | null;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  embedUrl?: string | null;
  metadata?: Record<string, unknown>;
  uploaderUserId?: string;
  uploaderProviderId?: string | null;
  allowedRoleSlugs?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type GameListResponse = {
  games: GameResource[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UpdateGamePayload = {
  title?: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  allowedRoleSlugs?: string[];
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
  status: TelehealthRoomStatus;
  joinUrl?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isRecordingEnabled: boolean;
  participants: Array<{ id: string; name: string; email: string; role: string }>;
};

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type PushTokenRegisterPayload = {
  token: string;
  deviceType?: string;
  deviceId?: string;
};

export type NotificationCategory =
  | "DIRECT_MESSAGE"
  | "COMMUNITY_MESSAGE"
  | "COMMUNITY_ANNOUNCEMENT"
  | "APPOINTMENT_REMINDER"
  | "TASK_REMINDER"
  | "SYSTEM";

export type NotificationPriority = 'info' | 'warning' | 'success' | 'error';

export type NotificationItem = {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  content: string;
  priority?: NotificationPriority;
  data?: Record<string, unknown>;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  notifications: NotificationItem[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type ResourceType = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  fileUrl?: string;
  resourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_USER'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportCategory =
  | 'ACCOUNT'
  | 'APPOINTMENT'
  | 'TECHNICAL'
  | 'BILLING'
  | 'CAREGIVER_SUPPORT'
  | 'PROVIDER_SUPPORT'
  | 'OTHER';

export type SupportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type SupportSenderRole = 'USER' | 'SUPPORT';

export type SupportMessage = {
  messageId: string;
  ticketId: string;
  senderId: string;
  senderRole: SupportSenderRole;
  sender?: {
    id: string;
    fullName?: string | null;
    userType?: string | null;
    profileImage?: string | null;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type SupportTicket = {
  ticketNumber?: string;
  ticketId: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportPriority;
  assignedTo?: string | null;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
};

export type SupportTicketsListResponse = {
  tickets: SupportTicket[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateSupportTicketPayload = {
  category: SupportCategory;
  subject: string;
  description: string;
  attachments?: string[];
  priority?: SupportPriority;
};

export type AddSupportMessagePayload = {
  content: string;
};

export type AdminUpdateSupportTicketPayload = {
  status?: SupportTicketStatus;
  priority?: SupportPriority;
  assignedTo?: string | null;
};

export type FaqCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
};

export type FaqArticle = {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  category?: FaqCategory;
  tags?: string[];
  isPublished: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FaqListResponse = {
  faqs: FaqArticle[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type FaqCategoriesResponse = {
  categories: FaqCategory[];
};

export type SupportTicketFilters = {
  page?: number;
  limit?: number;
  status?: SupportTicketStatus;
  category?: SupportCategory;
};

// referrals

export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

export type ReferralListItem = {
  id: string;
  patientId: string;
  fromProviderId: string;
  toProviderId?: string | null;
  toProfession: string;
  reason: string;
  status: ReferralStatus;
  createdAt: string;
  patient?: {
    id: string;
    fullName: string;
  };
  fromProvider?: {
    id: string;
    profession: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
  toProvider?: {
    id: string;
    profession: string;
    user?: {
      id: string;
      fullName: string;
    };
  };
  relatedAssessment?: {
    id: string;
    toolCode: string;
    status: string;
    assessedAt?: string | null;
  } | null;
};

export type CreateReferralPayload = {
  patientId: string;
  assessmentId?: string;
  toProfession: string;
  toProviderId?: string;
  reason: string;
  crossOrgConfirmed?: boolean;
};

export type UpdateReferralStatusPayload = {
  status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
};

export type ReferralClassificationFinding = {
  classifier: string;
  level: number;
  suggestedProfessions: string[];
  note: string;
};

export type ReferralRecommendationResponse = {
  assessmentId?: string;
  toolCode?: string;
  suggestedProfessions: string[];
  dimensionFindings: Array<Record<string, unknown>>;
  classificationFindings?: ReferralClassificationFinding[];
  classification?: { id: string; classifier: string; level: number; assessedAt: string } | null;
  reasoning: string;
};

export type CreateRehabTaskFromReferralPayload = {
  title: string;
  instructions: string;
  instructionSteps?: string[];
  frequencyPerDay?: number;
  frequencyNote?: string;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
};

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
};
