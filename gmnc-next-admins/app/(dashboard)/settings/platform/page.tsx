'use client';

import React, { useCallback } from 'react';
import { Settings } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getPlatformGeneralSettings,
  updatePlatformGeneralSettings,
  type PlatformGeneralSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'appName', label: 'Application Name', type: 'text' as const, description: 'Display name of the platform', placeholder: 'GMNC' },
  { key: 'appTagline', label: 'Tagline', type: 'text' as const, description: 'Short tagline shown in the header', placeholder: 'Get My Neuro Care' },
  { key: 'supportEmail', label: 'Support Email', type: 'text' as const, description: 'Primary support contact email', placeholder: 'support@gmnc.com' },
  { key: 'supportPhone', label: 'Support Phone', type: 'text' as const, description: 'Primary support phone number', placeholder: '+233...' },
  {
    key: 'timezone',
    label: 'Timezone',
    type: 'select' as const,
    description: 'Default timezone for the platform',
    options: [
      { label: 'Africa/Accra (GMT)', value: 'Africa/Accra' },
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
      { label: 'Europe/London', value: 'Europe/London' },
    ],
  },
  {
    key: 'dateFormat',
    label: 'Date Format',
    type: 'select' as const,
    options: [
      { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
      { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
      { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    ],
  },
  {
    key: 'language',
    label: 'Language',
    type: 'select' as const,
    options: [
      { label: 'English', value: 'en' },
      { label: 'French', value: 'fr' },
      { label: 'Twi', value: 'tw' },
    ],
  },
  { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle' as const, description: 'Put the platform in maintenance mode' },
  { key: 'maintenanceMessage', label: 'Maintenance Message', type: 'textarea' as const, description: 'Message shown during maintenance', placeholder: 'System is under maintenance...' },
];

export default function PlatformSettingsRoute() {
  const fetch = useCallback(() => getPlatformGeneralSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updatePlatformGeneralSettings(data as Partial<PlatformGeneralSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="General Platform Settings"
      description="Configure core platform settings."
      icon={Settings}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}