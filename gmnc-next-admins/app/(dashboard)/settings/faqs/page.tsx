'use client';

import React, { useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getFaqSettings,
  updateFaqSettings,
  type FaqSettings,
} from '@/lib/api/settings';

const POSITION_OPTIONS = [
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Top Left', value: 'top-left' },
];

const FIELDS = [
  { key: 'enableFaqModule', label: 'Enable FAQ Module', type: 'toggle' as const, description: 'Show FAQ section in the platform' },
  { key: 'showHelpWidget', label: 'Show Help Widget', type: 'toggle' as const, description: 'Display floating help button' },
  { key: 'helpWidgetPosition', label: 'Help Widget Position', type: 'select' as const, options: POSITION_OPTIONS },
  { key: 'enableSearchSuggestions', label: 'Enable Search Suggestions', type: 'toggle' as const, description: 'Show suggestions while searching FAQs' },
  { key: 'showPopularFaqs', label: 'Show Popular FAQs', type: 'toggle' as const, description: 'Display popular FAQs on the help page' },
  { key: 'faqsPerPage', label: 'FAQs Per Page', type: 'number' as const, min: 5, max: 50, unit: 'items' },
  { key: 'enableFeedbackOnFaqs', label: 'Enable FAQ Feedback', type: 'toggle' as const, description: 'Allow users to rate FAQ helpfulness' },
  { key: 'requireApprovalForPublicFaq', label: 'Require Approval for Public', type: 'toggle' as const, description: 'FAQs must be approved before going public' },
];

export default function FaqSettingsRoute() {
  const fetch = useCallback(() => getFaqSettings() as Promise<Record<string, unknown>>, []);
  const update = useCallback(
    (data: Record<string, unknown>) => updateFaqSettings(data as Partial<FaqSettings>),
    []
  );

  return (
    <PlatformSettingsPage
      title="FAQ Management"
      description="Configure FAQ display and management settings."
      icon={HelpCircle}
      fields={FIELDS}
      fetchSettings={fetch}
      updateSettings={update}
    />
  );
}