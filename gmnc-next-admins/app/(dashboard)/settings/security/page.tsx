'use client';

import React, { useCallback } from 'react';
import { Lock } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getSecuritySettings,
  updateSecuritySettings,
  type SecuritySettings,
} from '@/lib/api/settings';

const FIELDS = [
  { key: 'enforceStrongPasswords', label: 'Enforce Strong Passwords', type: 'toggle' as const, description: 'Require uppercase, lowercase, and numbers' },
  { key: 'minPasswordLength', label: 'Minimum Password Length', type: 'number' as const, min: 6, max: 32 },
  { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number' as const, description: 'Attempts before lockout', min: 3, max: 20 },
  { key: 'lockoutDurationMinutes', label: 'Lockout Duration', type: 'number' as const, description: 'Minutes to lock account after max attempts', min: 5, max: 1440, unit: 'min' },
  { key: 'sessionTimeoutMinutes', label: 'Session Timeout', type: 'number' as const, description: 'Minutes of inactivity before logout', min: 15, max: 480, unit: 'min' },
  { key: 'requireEmailVerification', label: 'Require Email Verification', type: 'toggle' as const, description: 'Users must verify email before access' },
  { key: 'enableTwoFactorAuth', label: 'Enable Two-Factor Authentication', type: 'toggle' as const, description: 'Allow users to enable 2FA' },
  { key: 'allowPasswordReset', label: 'Allow Password Reset', type: 'toggle' as const, description: 'Allow self-service password reset' },
  { key: 'passwordExpiryDays', label: 'Password Expiry', type: 'number' as const, description: 'Force password change after this many days (0 = never)', min: 0, max: 365, unit: 'days' },
];

export default function SecuritySettingsRoute() {
  const fetch = useCallback(() => getSecuritySettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateSecuritySettings(data as Partial<SecuritySettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Security Settings"
      description="Configure security policies and access controls."
      icon={Lock}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}