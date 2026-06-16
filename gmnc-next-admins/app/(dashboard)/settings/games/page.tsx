'use client';

import React, { useCallback } from 'react';
import { Gamepad2 } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getGamesSettings,
  updateGamesSettings,
  type GamesSettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'enableGamesModule', label: 'Enable Games Module', type: 'toggle' as const, description: 'Enable games and wellbeing features' },
  { key: 'allowYouTubeGames', label: 'Allow YouTube Games', type: 'toggle' as const, description: 'Allow embedding YouTube games' },
  { key: 'allowExternalGames', label: 'Allow External Games', type: 'toggle' as const, description: 'Allow linking to external game sites' },
  { key: 'requireApprovalForUpload', label: 'Require Upload Approval', type: 'toggle' as const, description: 'Admin must approve uploaded games' },
  { key: 'maxFileSizeMB', label: 'Max File Size', type: 'number' as const, description: 'Maximum upload file size in MB', min: 10, max: 500, unit: 'MB' },
  { key: 'enableGameAnalytics', label: 'Enable Game Analytics', type: 'toggle' as const, description: 'Track game engagement metrics' },
  { key: 'enableGameRecommendations', label: 'Enable Recommendations', type: 'toggle' as const, description: 'Show recommended games to users' },
  { key: 'enableCaregiverAccess', label: 'Enable Caregiver Access', type: 'toggle' as const, description: 'Allow caregivers to access games' },
];

export default function GamesSettingsRoute() {
  const fetch = useCallback(() => getGamesSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateGamesSettings(data as Partial<GamesSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Games & Activity Settings"
      description="Configure games and activity engagement settings."
      icon={Gamepad2}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}