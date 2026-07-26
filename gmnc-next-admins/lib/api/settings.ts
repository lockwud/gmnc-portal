import { AppointmentSettingsType, WorkingHoursItem } from './types';

export const DEFAULT_SETTINGS: AppointmentSettingsType = {
  allowPatientBooking: true,
  minAppointmentNotice: 24,
  defaultDuration: 30,
  bufferTime: 15,
  maxDailyAppointments: 20,
  enableReminders: true,
  reminderLeadTime: 2,
  requireConfirmation: false,
  enableWaitlist: true,
  slotInterval: 30,
  workingHours: [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
  ],
};

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

async function tryRefreshSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('gmnc_token', data.accessToken);
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
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

  if (res.status === 401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const newToken = getToken();
      const retryRes = await fetch(path, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
        cache: 'no-store',
      });
      return parseJson<T>(retryRes);
    }
  }

  return parseJson<T>(res);
}

async function apiPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const newToken = getToken();
      const retryRes = await fetch(path, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
      return parseJson<T>(retryRes);
    }
  }

  return parseJson<T>(res);
}

// ── Appointment Settings ────────────────────────────────────────────────

export async function getAppointmentSettings(token?: string | null): Promise<AppointmentSettingsType> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AppointmentSettingsType;
  }>('/api/settings/appointments', token);

  return res.data;
}

export async function updateAppointmentSettings(
  settings: AppointmentSettingsType,
  token?: string | null
): Promise<AppointmentSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: AppointmentSettingsType;
  }>('/api/settings/appointments', settings, token);

  return res.data;
}

// ── Generic Platform Settings ───────────────────────────────────────────

export type PlatformGeneralSettings = {
  appName: string;
  appTagline: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  dateFormat: string;
  language: string;
  logoUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export type WorkspaceSettings = {
  defaultDashboardView: string;
  enableDarkMode: boolean;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  defaultSortOrder: string;
  showPatientIds: boolean;
  enableQuickActions: boolean;
};

export type SecuritySettings = {
  enforceStrongPasswords: boolean;
  minPasswordLength: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  requireEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
  allowPasswordReset: boolean;
  passwordExpiryDays: number;
  allowedIpRanges: string[];
};

export type ReferralSettings = {
  enableAutoAssignment: boolean;
  defaultReferralExpiryDays: number;
  enableSLATracking: boolean;
  slaWarningHours: number;
  slaEscalationHours: number;
  requireClinicalNotes: boolean;
  enableReferralNotifications: boolean;
  allowedTargetProfessions: string[];
};

export type AssessmentSettings = {
  enableAssessmentModule: boolean;
  requireCompletedReferralForAssessment: boolean;
  allowDraftAssessments: boolean;
  allowAssessmentResubmission: boolean;
  requireClinicalNotesOnSubmit: boolean;
  requireRegularPerformanceConfirmation: boolean;
  autoGenerateReportOnSubmit: boolean;
  defaultToolVersion: string;
  activeAssessmentToolCodes: string[];
  providerProfessionsAllowedToAssess: string[];
  mobileAssessmentInstructions: string;
};

export type AssessmentToolAdminRecord = {
  id: string;
  toolCode: string;
  toolName: string;
  version: string;
  description?: string | null;
  schema?: Record<string, unknown> | null;
  isActive: boolean;
  professions?: Array<{ profession: string } | string>;
  createdAt?: string;
  updatedAt?: string;
};

export type ClinicalNotesSettings = {
  requireAssessmentNotes: boolean;
  requireSessionDocumentation: boolean;
  enableNoteTemplates: boolean;
  defaultNoteTemplates: string[];
  enableAutoSave: boolean;
  autoSaveIntervalSeconds: number;
  requireSignatureForNotes: boolean;
  noteRetentionDays: number;
  enableClinicalTags: boolean;
};

export type SupportSettings = {
  enableAutoResponse: boolean;
  defaultTicketPriority: string;
  autoAssignTickets: boolean;
  enableCannedResponses: boolean;
  slaResponseHours: number;
  slaResolutionHours: number;
  enableSatisfactionSurvey: boolean;
  allowAnonymousTickets: boolean;
  enableEscalation: boolean;
};

export type EscalationCategory = {
  id: string;
  name: string;
  severity: string;
  autoEscalate: boolean;
};

export type EscalationSettings = {
  enableAutoEscalation: boolean;
  escalationThresholdHours: number;
  maxEscalationLevel: number;
  notifyOnEscalation: boolean;
  escalationRecipients: string[];
  categories: EscalationCategory[];
};

export type ComplianceSettings = {
  enableHipaaCompliance: boolean;
  dataEncryptionAtRest: boolean;
  dataEncryptionInTransit: boolean;
  auditTrailEnabled: boolean;
  auditLogRetentionDays: number;
  enablePatientDataExport: boolean;
  enableRightToErasure: boolean;
  dpoEmail: string;
};

export type DataRetentionSettings = {
  enableAutoCleanup: boolean;
  patientDataRetentionDays: number;
  assessmentRetentionDays: number;
  messageRetentionDays: number;
  appointmentRetentionDays: number;
  auditLogRetentionDays: number;
  telehealthRecordingRetentionDays: number;
  inactiveAccountRetentionDays: number;
  enableRetentionNotifications: boolean;
  notificationBeforeDays: number;
};

export type GamesSettings = {
  enableGamesModule: boolean;
  allowYouTubeGames: boolean;
  allowExternalGames: boolean;
  requireApprovalForUpload: boolean;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  enableGameAnalytics: boolean;
  enableGameRecommendations: boolean;
  defaultAgeRange: { min: number; max: number };
  enableCaregiverAccess: boolean;
};

export type FaqSettings = {
  enableFaqModule: boolean;
  showHelpWidget: boolean;
  helpWidgetPosition: string;
  enableSearchSuggestions: boolean;
  showPopularFaqs: boolean;
  faqsPerPage: number;
  enableFeedbackOnFaqs: boolean;
  requireApprovalForPublicFaq: boolean;
};

export type NotificationSettings = {
  enableInAppNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  notifyOnReferrals: boolean;
  notifyOnAssessments: boolean;
  notifyOnAppointments: boolean;
  notifyOnSupportTickets: boolean;
  notifyOnProviderApprovals: boolean;
  notifyOnEscalations: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  digestFrequency: string;
  retentionDays: number;
};

// ── Generic fetch/update helpers ────────────────────────────────────────

async function fetchPlatformSetting<T>(path: string, token?: string | null): Promise<T> {
  const res = await apiGet<{ status: boolean; data: T }>(path, token);
  return res.data;
}

async function updatePlatformSetting<T>(path: string, data: Partial<T>, token?: string | null): Promise<T> {
  const res = await apiPut<{ status: boolean; data: T }>(path, data, token);
  return res.data;
}

// ── Platform General ────────────────────────────────────────────────────

export async function getPlatformGeneralSettings(token?: string | null): Promise<PlatformGeneralSettings> {
  return fetchPlatformSetting<PlatformGeneralSettings>('/api/settings/platform', token);
}

export async function updatePlatformGeneralSettings(
  settings: Partial<PlatformGeneralSettings>,
  token?: string | null
): Promise<PlatformGeneralSettings> {
  return updatePlatformSetting<PlatformGeneralSettings>('/api/settings/platform', settings, token);
}

// ── Workspace ───────────────────────────────────────────────────────────

export async function getWorkspaceSettings(token?: string | null): Promise<WorkspaceSettings> {
  return fetchPlatformSetting<WorkspaceSettings>('/api/settings/workspace', token);
}

export async function updateWorkspaceSettings(
  settings: Partial<WorkspaceSettings>,
  token?: string | null
): Promise<WorkspaceSettings> {
  return updatePlatformSetting<WorkspaceSettings>('/api/settings/workspace', settings, token);
}

// ── Security ────────────────────────────────────────────────────────────

export async function getSecuritySettings(token?: string | null): Promise<SecuritySettings> {
  return fetchPlatformSetting<SecuritySettings>('/api/settings/security', token);
}

export async function updateSecuritySettings(
  settings: Partial<SecuritySettings>,
  token?: string | null
): Promise<SecuritySettings> {
  return updatePlatformSetting<SecuritySettings>('/api/settings/security', settings, token);
}

// ── Referrals ───────────────────────────────────────────────────────────

export async function getReferralSettings(token?: string | null): Promise<ReferralSettings> {
  return fetchPlatformSetting<ReferralSettings>('/api/settings/referrals', token);
}

export async function updateReferralSettings(
  settings: Partial<ReferralSettings>,
  token?: string | null
): Promise<ReferralSettings> {
  return updatePlatformSetting<ReferralSettings>('/api/settings/referrals', settings, token);
}

// ── Assessment ──────────────────────────────────────────────────────────

export async function getAssessmentSettings(token?: string | null): Promise<AssessmentSettings> {
  return fetchPlatformSetting<AssessmentSettings>('/api/settings/assessment', token);
}

export async function updateAssessmentSettings(
  settings: Partial<AssessmentSettings>,
  token?: string | null
): Promise<AssessmentSettings> {
  return updatePlatformSetting<AssessmentSettings>('/api/settings/assessment', settings, token);
}

export async function getAdminAssessmentTools(token?: string | null): Promise<AssessmentToolAdminRecord[]> {
  const res = await apiGet<{
    status?: boolean;
    data?: AssessmentToolAdminRecord[] | { data?: AssessmentToolAdminRecord[] };
  }>('/api/admin/assessment-tools?limit=200', token);

  if (Array.isArray(res.data)) return res.data;
  return res.data?.data ?? [];
}

export async function createAdminAssessmentTool(
  payload: {
    toolCode: string;
    toolName: string;
    version?: string;
    description?: string;
    schema?: Record<string, unknown>;
    professions?: string[];
  },
  token?: string | null
): Promise<AssessmentToolAdminRecord> {
  const authToken = token ?? getToken();
  const res = await fetch('/api/admin/assessment-tools', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ data: AssessmentToolAdminRecord }>(res);
  return data.data;
}

export async function updateAdminAssessmentTool(
  id: string,
  payload: Partial<Pick<AssessmentToolAdminRecord, 'isActive' | 'description' | 'schema'>>,
  token?: string | null
): Promise<AssessmentToolAdminRecord> {
  const authToken = token ?? getToken();
  const res = await fetch(`/api/admin/assessment-tools/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ data: AssessmentToolAdminRecord }>(res);
  return data.data;
}

// ── Clinical Notes ──────────────────────────────────────────────────────

export async function getClinicalNotesSettings(token?: string | null): Promise<ClinicalNotesSettings> {
  return fetchPlatformSetting<ClinicalNotesSettings>('/api/settings/clinical-notes', token);
}

export async function updateClinicalNotesSettings(
  settings: Partial<ClinicalNotesSettings>,
  token?: string | null
): Promise<ClinicalNotesSettings> {
  return updatePlatformSetting<ClinicalNotesSettings>('/api/settings/clinical-notes', settings, token);
}

// ── Support ─────────────────────────────────────────────────────────────

export async function getSupportSettings(token?: string | null): Promise<SupportSettings> {
  return fetchPlatformSetting<SupportSettings>('/api/settings/support', token);
}

export async function updateSupportSettings(
  settings: Partial<SupportSettings>,
  token?: string | null
): Promise<SupportSettings> {
  return updatePlatformSetting<SupportSettings>('/api/settings/support', settings, token);
}

// ── Escalations ─────────────────────────────────────────────────────────

export async function getEscalationSettings(token?: string | null): Promise<EscalationSettings> {
  return fetchPlatformSetting<EscalationSettings>('/api/settings/escalations', token);
}

export async function updateEscalationSettings(
  settings: Partial<EscalationSettings>,
  token?: string | null
): Promise<EscalationSettings> {
  return updatePlatformSetting<EscalationSettings>('/api/settings/escalations', settings, token);
}

// ── Compliance ──────────────────────────────────────────────────────────

export async function getComplianceSettings(token?: string | null): Promise<ComplianceSettings> {
  return fetchPlatformSetting<ComplianceSettings>('/api/settings/compliance', token);
}

export async function updateComplianceSettings(
  settings: Partial<ComplianceSettings>,
  token?: string | null
): Promise<ComplianceSettings> {
  return updatePlatformSetting<ComplianceSettings>('/api/settings/compliance', settings, token);
}

// ── Data Retention ──────────────────────────────────────────────────────

export async function getDataRetentionSettings(token?: string | null): Promise<DataRetentionSettings> {
  return fetchPlatformSetting<DataRetentionSettings>('/api/settings/data-retention', token);
}

export async function updateDataRetentionSettings(
  settings: Partial<DataRetentionSettings>,
  token?: string | null
): Promise<DataRetentionSettings> {
  return updatePlatformSetting<DataRetentionSettings>('/api/settings/data-retention', settings, token);
}

// ── Games ───────────────────────────────────────────────────────────────

export async function getGamesSettings(token?: string | null): Promise<GamesSettings> {
  return fetchPlatformSetting<GamesSettings>('/api/settings/games', token);
}

export async function updateGamesSettings(
  settings: Partial<GamesSettings>,
  token?: string | null
): Promise<GamesSettings> {
  return updatePlatformSetting<GamesSettings>('/api/settings/games', settings, token);
}

// ── FAQs ────────────────────────────────────────────────────────────────

export async function getFaqSettings(token?: string | null): Promise<FaqSettings> {
  return fetchPlatformSetting<FaqSettings>('/api/settings/faqs', token);
}

export async function updateFaqSettings(
  settings: Partial<FaqSettings>,
  token?: string | null
): Promise<FaqSettings> {
  return updatePlatformSetting<FaqSettings>('/api/settings/faqs', settings, token);
}

// ── Notifications ───────────────────────────────────────────────────────

export async function getNotificationSettings(token?: string | null): Promise<NotificationSettings> {
  return fetchPlatformSetting<NotificationSettings>('/api/settings/notifications', token);
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>,
  token?: string | null
): Promise<NotificationSettings> {
  return updatePlatformSetting<NotificationSettings>('/api/settings/notifications', settings, token);
}

// ── Provider Appointment Settings ───────────────────────────────────────

export type ProviderAppointmentSettingsType = {
  id?: string;
  providerId?: string;
  allowPatientBooking: boolean;
  minAppointmentNotice: number;
  defaultDuration: number;
  bufferTime: number;
  maxDailyAppointments: number;
  enableReminders: boolean;
  reminderLeadTime: number;
  requireConfirmation: boolean;
  enableWaitlist: boolean;
  slotInterval: number;
  workingHours: WorkingHoursItem[];
}

export const PROVIDER_DEFAULT_SETTINGS: ProviderAppointmentSettingsType = {
  allowPatientBooking: true,
  minAppointmentNotice: 24,
  defaultDuration: 30,
  bufferTime: 15,
  maxDailyAppointments: 20,
  enableReminders: true,
  reminderLeadTime: 2,
  requireConfirmation: false,
  enableWaitlist: true,
  slotInterval: 30,
  workingHours: [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
  ],
};

export async function getProviderAppointmentSettings(token?: string | null): Promise<ProviderAppointmentSettingsType> {
  const res = await apiGet<{
    status: boolean;
    data: ProviderAppointmentSettingsType;
  }>('/api/settings/provider-appointments', token);
  return res.data;
}

export async function updateProviderAppointmentSettings(
  settings: ProviderAppointmentSettingsType,
  token?: string | null
): Promise<ProviderAppointmentSettingsType> {
  const res = await apiPut<{
    status: boolean;
    message?: string;
    data: ProviderAppointmentSettingsType;
  }>('/api/settings/provider-appointments', settings, token);
  return res.data;
}

// ── User Appearance Settings ────────────────────────────────────────────

export type AppearanceSettings = {
  themeMode: string;
  colorPreset: string;
  fontFamily: string;
  fontSize: string;
};

export async function getUserAppearance(userId: string, token?: string | null): Promise<AppearanceSettings> {
  return fetchPlatformSetting<AppearanceSettings>(`/api/settings/appearance/${userId}`, token);
}

export async function updateUserAppearance(
  userId: string,
  settings: Partial<AppearanceSettings>,
  token?: string | null
): Promise<AppearanceSettings> {
  return updatePlatformSetting<AppearanceSettings>(`/api/settings/appearance/${userId}`, settings, token);
}
