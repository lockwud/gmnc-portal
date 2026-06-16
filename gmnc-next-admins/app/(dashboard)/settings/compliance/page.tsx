'use client';

import React, { useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getComplianceSettings,
  updateComplianceSettings,
  type ComplianceSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'requireConsentForDataSharing', label: 'Require Data Sharing Consent', type: 'toggle' as const, description: 'Consent required for data sharing' },
  { key: 'requireConsentForRecording', label: 'Require Recording Consent', type: 'toggle' as const, description: 'Consent required for session recording' },
  { key: 'requireConsentForPhoto', label: 'Require Photo/Video Consent', type: 'toggle' as const, description: 'Consent required for photo/video capture' },
  { key: 'enableHipaaCompliance', label: 'Enable HIPAA Compliance', type: 'toggle' as const, description: 'Enforce HIPAA compliance rules' },
  { key: 'dataEncryptionAtRest', label: 'Data Encryption at Rest', type: 'toggle' as const, description: 'Encrypt stored data' },
  { key: 'dataEncryptionInTransit', label: 'Data Encryption in Transit', type: 'toggle' as const, description: 'Encrypt data during transfer' },
  { key: 'auditTrailEnabled', label: 'Enable Audit Trail', type: 'toggle' as const, description: 'Track all user actions' },
  { key: 'auditLogRetentionDays', label: 'Audit Log Retention', type: 'number' as const, description: 'Days to retain audit logs', min: 30, max: 3650, unit: 'days' },
  { key: 'enablePatientDataExport', label: 'Enable Patient Data Export', type: 'toggle' as const, description: 'Allow patients to export their data' },
  { key: 'enableRightToErasure', label: 'Enable Right to Erasure', type: 'toggle' as const, description: 'Allow patients to request data deletion' },
  { key: 'dpoEmail', label: 'DPO Email', type: 'text' as const, description: 'Data Protection Officer email', placeholder: 'dpo@example.com' },
];

export default function ComplianceRoute() {
  const fetch = useCallback(() => getComplianceSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateComplianceSettings(data as Partial<ComplianceSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Compliance & Consent"
      description="Configure compliance and consent settings."
      icon={ShieldCheck}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}