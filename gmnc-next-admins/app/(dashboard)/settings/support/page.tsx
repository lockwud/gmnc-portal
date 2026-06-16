'use client';

import React, { useCallback } from 'react';
import { Headphones } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getSupportSettings,
  updateSupportSettings,
  type SupportSettings,
} from '@/lib/api/settings';

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

const FIELDS = [
  { key: 'enableAutoResponse', label: 'Enable Auto-Response', type: 'toggle' as const, description: 'Send automatic acknowledgment for new tickets' },
  {
    key: 'defaultTicketPriority',
    label: 'Default Ticket Priority',
    type: 'select' as const,
    description: 'Default priority for new tickets',
    options: PRIORITY_OPTIONS,
  },
  { key: 'autoAssignTickets', label: 'Auto-Assign Tickets', type: 'toggle' as const, description: 'Automatically assign tickets to available agents' },
  { key: 'enableCannedResponses', label: 'Enable Canned Responses', type: 'toggle' as const, description: 'Allow agents to use pre-written responses' },
  { key: 'slaResponseHours', label: 'SLA Response Time', type: 'number' as const, description: 'Hours to first response', min: 1, max: 72, unit: 'hrs' },
  { key: 'slaResolutionHours', label: 'SLA Resolution Time', type: 'number' as const, description: 'Hours to resolve ticket', min: 1, max: 168, unit: 'hrs' },
  { key: 'enableSatisfactionSurvey', label: 'Enable Satisfaction Survey', type: 'toggle' as const, description: 'Send survey after ticket resolution' },
  { key: 'allowAnonymousTickets', label: 'Allow Anonymous Tickets', type: 'toggle' as const, description: 'Allow tickets without login' },
  { key: 'enableEscalation', label: 'Enable Ticket Escalation', type: 'toggle' as const, description: 'Allow support tickets to be escalated' },
];

export default function SupportWorkflowRoute() {
  const fetch = useCallback(() => getSupportSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateSupportSettings(data as Partial<SupportSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="Support Workflow Rules"
      description="Configure support workflow and ticketing rules."
      icon={Headphones}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}