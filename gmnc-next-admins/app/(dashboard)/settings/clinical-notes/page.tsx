'use client';

import React, { useCallback } from 'react';
import { ClipboardList } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getClinicalNotesSettings,
  updateClinicalNotesSettings,
  type ClinicalNotesSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'requireAssessmentNotes', label: 'Require Assessment Notes', type: 'toggle' as const, description: 'Require notes for every assessment' },
  { key: 'requireSessionDocumentation', label: 'Require Session Documentation', type: 'toggle' as const, description: 'Require notes for telehealth sessions' },
  { key: 'enableNoteTemplates', label: 'Enable Note Templates', type: 'toggle' as const, description: 'Allow using pre-built note templates' },
  { key: 'enableAutoSave', label: 'Enable Auto-Save', type: 'toggle' as const, description: 'Automatically save notes while editing' },
  { key: 'autoSaveIntervalSeconds', label: 'Auto-Save Interval', type: 'number' as const, description: 'Seconds between auto-saves', min: 10, max: 300, unit: 'sec' },
  { key: 'requireSignatureForNotes', label: 'Require Signature for Notes', type: 'toggle' as const, description: 'Provider must sign clinical notes' },
  { key: 'noteRetentionDays', label: 'Note Retention Period', type: 'number' as const, description: 'Days to retain clinical notes', min: 30, max: 3650, unit: 'days' },
  { key: 'enableClinicalTags', label: 'Enable Clinical Tags', type: 'toggle' as const, description: 'Allow tagging notes with categories' },
];

export default function ClinicalNotesSettingsRoute() {
  const fetch = useCallback(() => getClinicalNotesSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateClinicalNotesSettings(data as Partial<ClinicalNotesSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Clinical Notes & Tasks Settings"
      description="Configure clinical notes and task settings."
      icon={ClipboardList}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}