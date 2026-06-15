'use client';

import React, { useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getReferralSettings,
  updateReferralSettings,
  type ReferralSettings,
} from '@/lib/api/settings';

const PROFESSION_OPTIONS = [
  { label: 'Physiotherapist', value: 'PHYSIOTHERAPIST' },
  { label: 'Occupational Therapist', value: 'OCCUPATIONAL_THERAPIST' },
  { label: 'Speech Therapist', value: 'SPEECH_THERAPIST' },
  { label: 'Clinical Psychologist', value: 'CLINICAL_PSYCHOLOGIST' },
  { label: 'Dietitian', value: 'DIETITIAN' },
  { label: 'Pharmacist', value: 'PHARMACIST' },
  { label: 'General Paediatrician', value: 'GENERAL_PAEDIATRICIAN' },
  { label: 'Paediatric Neurologist', value: 'PAEDIATRIC_NEUROLOGIST' },
];

const FIELDS = [
  { key: 'enableAutoAssignment', label: 'Enable Auto-Assignment', type: 'toggle' as const, description: 'Automatically assign referrals to available providers' },
  { key: 'defaultReferralExpiryDays', label: 'Default Referral Expiry', type: 'number' as const, description: 'Days before referral expires', min: 1, max: 90, unit: 'days' },
  { key: 'enableSLATracking', label: 'Enable SLA Tracking', type: 'toggle' as const, description: 'Track referral response times' },
  { key: 'slaWarningHours', label: 'SLA Warning Threshold', type: 'number' as const, description: 'Hours before SLA warning', min: 1, max: 168, unit: 'hrs' },
  { key: 'slaEscalationHours', label: 'SLA Escalation Threshold', type: 'number' as const, description: 'Hours before SLA escalation', min: 1, max: 336, unit: 'hrs' },
  { key: 'requireClinicalNotes', label: 'Require Clinical Notes', type: 'toggle' as const, description: 'Require clinical notes with referral' },
  { key: 'enableReferralNotifications', label: 'Enable Notifications', type: 'toggle' as const, description: 'Send notifications for referral updates' },
  { key: 'allowedTargetProfessions', label: 'Allowed Target Professions', type: 'multi-select' as const, description: 'Professions that can receive referrals', options: PROFESSION_OPTIONS },
];

export default function ReferralsSettingsRoute() {
  const fetch = useCallback(() => getReferralSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateReferralSettings(data as Partial<ReferralSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Referral Workflow Settings"
      description="Configure referral workflows and routing rules."
      icon={ArrowLeftRight}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}