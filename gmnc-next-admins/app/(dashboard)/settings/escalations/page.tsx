'use client';

import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getEscalationSettings,
  updateEscalationSettings,
  type EscalationSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'enableAutoEscalation', label: 'Enable Auto-Escalation', type: 'toggle' as const, description: 'Automatically escalate overdue tickets' },
  { key: 'escalationThresholdHours', label: 'Escalation Threshold', type: 'number' as const, description: 'Hours before auto-escalation', min: 1, max: 168, unit: 'hrs' },
  { key: 'maxEscalationLevel', label: 'Max Escalation Level', type: 'number' as const, description: 'Maximum escalation levels', min: 1, max: 5 },
  { key: 'notifyOnEscalation', label: 'Notify on Escalation', type: 'toggle' as const, description: 'Send notifications when tickets are escalated' },
];

export default function EscalationsRoute() {
  const fetch = useCallback(() => getEscalationSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateEscalationSettings(data as Partial<EscalationSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Issue Categories & Escalations"
      description="Configure issue categories and escalation rules."
      icon={AlertTriangle}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}