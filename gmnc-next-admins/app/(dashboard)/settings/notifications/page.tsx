'use client';

import React, { useCallback } from 'react';
import { Bell } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '@/lib/api/settings';

const fields = [
  { key: 'enableInAppNotifications', label: 'In-app Notifications', type: 'toggle' as const, description: 'Show notifications in the portal and notification drawer' },
  { key: 'enableEmailNotifications', label: 'Email Notifications', type: 'toggle' as const, description: 'Send workflow updates by email when available' },
  { key: 'enableSmsNotifications', label: 'SMS Notifications', type: 'toggle' as const, description: 'Allow SMS alerts for critical caregiver/provider updates' },
  { key: 'notifyOnReferrals', label: 'Referral Updates', type: 'toggle' as const, description: 'Notify users when referrals are created, assigned, or updated' },
  { key: 'notifyOnAssessments', label: 'Assessment Updates', type: 'toggle' as const, description: 'Notify providers/admins when assessments are submitted or reports are ready' },
  { key: 'notifyOnAppointments', label: 'Appointment Updates', type: 'toggle' as const, description: 'Notify users about appointment booking, reschedule, approval, and reminders' },
  { key: 'notifyOnSupportTickets', label: 'Support Tickets', type: 'toggle' as const, description: 'Notify users about support ticket creation, assignment, and closure' },
  { key: 'notifyOnProviderApprovals', label: 'Provider Approvals', type: 'toggle' as const, description: 'Notify admins and providers about verification workflow changes' },
  { key: 'notifyOnEscalations', label: 'Escalations', type: 'toggle' as const, description: 'Notify responsible users when issues or tickets are escalated' },
  { key: 'quietHoursEnabled', label: 'Quiet Hours', type: 'toggle' as const, description: 'Suppress non-critical notifications during quiet hours' },
  { key: 'quietHoursStart', label: 'Quiet Hours Start', type: 'text' as const, description: 'Start time in 24-hour format', placeholder: '20:00' },
  { key: 'quietHoursEnd', label: 'Quiet Hours End', type: 'text' as const, description: 'End time in 24-hour format', placeholder: '07:00' },
  {
    key: 'digestFrequency',
    label: 'Digest Frequency',
    type: 'select' as const,
    description: 'How often summary notifications should be sent',
    options: [
      { label: 'Never', value: 'never' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
    ],
  },
  { key: 'retentionDays', label: 'Notification Retention', type: 'number' as const, description: 'Days to keep notification records visible', min: 1, max: 3650, unit: 'days' },
];

export default function NotificationsSettingsPage() {
  const fetch = useCallback(() => getNotificationSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateNotificationSettings(data as Partial<NotificationSettings>),
    [],
  );

  return (
    <PlatformSettingsPage
      title="Notification Preferences"
      description="Configure notification channels and workflow events for admins, providers, caregivers, and support users."
      icon={Bell}
      fields={fields}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}
