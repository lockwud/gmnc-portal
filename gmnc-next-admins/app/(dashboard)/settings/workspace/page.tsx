'use client';

import React, { useCallback } from 'react';
import { LayoutDashboard } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getWorkspaceSettings,
  updateWorkspaceSettings,
  type WorkspaceSettings,
} from '@/lib/api/settings';

const FIELDS = [
  {
    key: 'defaultDashboardView',
    label: 'Default Dashboard View',
    type: 'select' as const,
    description: 'Which view users see by default',
    options: [
      { label: 'Overview', value: 'overview' },
      { label: 'Patients', value: 'patients' },
      { label: 'Appointments', value: 'appointments' },
    ],
  },
  { key: 'enableDarkMode', label: 'Allow Dark Mode', type: 'toggle' as const, description: 'Allow users to toggle dark mode' },
  { key: 'sidebarCollapsed', label: 'Collapsed Sidebar Default', type: 'toggle' as const, description: 'Start sidebar in collapsed state' },
  { key: 'itemsPerPage', label: 'Items Per Page', type: 'number' as const, description: 'Default pagination size', min: 5, max: 100 },
  {
    key: 'defaultSortOrder',
    label: 'Default Sort Order',
    type: 'select' as const,
    options: [
      { label: 'Newest First (Desc)', value: 'desc' },
      { label: 'Oldest First (Asc)', value: 'asc' },
    ],
  },
  { key: 'showPatientIds', label: 'Show Patient IDs', type: 'toggle' as const, description: 'Display patient IDs in lists' },
  { key: 'enableQuickActions', label: 'Enable Quick Actions', type: 'toggle' as const, description: 'Show quick action buttons' },
];

export default function WorkspaceSettingsRoute() {
  const fetch = useCallback(() => getWorkspaceSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateWorkspaceSettings(data as Partial<WorkspaceSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Workspace Preferences"
      description="Configure workspace preferences."
      icon={LayoutDashboard}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}