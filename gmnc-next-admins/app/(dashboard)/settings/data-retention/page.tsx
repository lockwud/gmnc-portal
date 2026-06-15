'use client';

import React, { useCallback } from 'react';
import { Database } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getDataRetentionSettings,
  updateDataRetentionSettings,
  type DataRetentionSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'enableAutoCleanup', label: 'Enable Auto-Cleanup', type: 'toggle' as const, description: 'Automatically purge expired data' },
  { key: 'patientDataRetentionDays', label: 'Patient Data Retention', type: 'number' as const, description: 'Days to keep patient records', min: 30, max: 3650, unit: 'days' },
  { key: 'assessmentRetentionDays', label: 'Assessment Retention', type: 'number' as const, description: 'Days to keep assessment records', min: 30, max: 3650, unit: 'days' },
  { key: 'messageRetentionDays', label: 'Message Retention', type: 'number' as const, description: 'Days to keep messages', min: 30, max: 3650, unit: 'days' },
  { key: 'appointmentRetentionDays', label: 'Appointment Retention', type: 'number' as const, description: 'Days to keep appointment history', min: 30, max: 3650, unit: 'days' },
  { key: 'auditLogRetentionDays', label: 'Audit Log Retention', type: 'number' as const, description: 'Days to keep audit logs', min: 30, max: 3650, unit: 'days' },
  { key: 'telehealthRecordingRetentionDays', label: 'Recording Retention', type: 'number' as const, description: 'Days to keep telehealth recordings', min: 1, max: 365, unit: 'days' },
  { key: 'inactiveAccountRetentionDays', label: 'Inactive Account Retention', type: 'number' as const, description: 'Days before inactive accounts are archived', min: 30, max: 3650, unit: 'days' },
  { key: 'enableRetentionNotifications', label: 'Enable Retention Notifications', type: 'toggle' as const, description: 'Notify users before data deletion' },
  { key: 'notificationBeforeDays', label: 'Notification Before Deletion', type: 'number' as const, description: 'Days before deletion to notify', min: 7, max: 90, unit: 'days' },
];

export default function DataRetentionRoute() {
  const fetch = useCallback(() => getDataRetentionSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateDataRetentionSettings(data as Partial<DataRetentionSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Data Retention Policies"
      description="Configure data retention and cleanup policies."
      icon={Database}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}