'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import PlatformSettingsPage from '@/components/settings/PlatformSettingsPage';
import {
  getFaqSettings,
  updateFaqSettings,
  type FaqSettings,
} from '@/lib/api/settings';
import { getCpIntro, updateCpIntro, type CpIntro } from '@/lib/api/support';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

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
    <>
      <PlatformSettingsPage
        title="FAQ Management"
        description="Configure FAQ display and management settings."
        icon={HelpCircle}
        fields={FIELDS}
        fetchSettings={fetch}
        updateSettings={update}
      />
      <CpIntroEditor />
    </>
  );
}

// Intro editor: the public CP onboarding content (beliefs vs facts, what CP
// is, how the app helps, how to open a ticket) that mobile caches offline.
function CpIntroEditor() {
  const { token } = useAuth();
  const { show } = useToast();
  const [intro, setIntro] = useState<CpIntro | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getCpIntro()
      .then((data) => { if (active) setIntro(data); })
      .catch(() => { if (active) setIntro(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const save = async () => {
    if (!intro) return;
    try {
      setSaving(true);
      const saved = await updateCpIntro(
        { title: intro.title, sections: intro.sections, offlineNote: intro.offlineNote },
        token ?? undefined,
      );
      setIntro(saved);
      show({ type: 'success', title: 'Intro updated', message: 'The public CP intro was saved.' });
    } catch (error) {
      show({ type: 'error', title: 'Save failed', message: error instanceof Error ? error.message : 'Failed to save intro' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black text-slate-950">CP Intro (public, cached offline by mobile)</h2>
      <p className="mt-1 text-xs text-slate-500">
        Shown to first-time and rural users before login. Version {intro?.version ?? '—'}
        {intro?.updatedAt ? ` · updated ${new Date(intro.updatedAt).toLocaleDateString()}` : ''}.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading intro…</p>
      ) : !intro ? (
        <p className="mt-4 text-sm text-slate-500">Intro unavailable.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Title</label>
            <input
              value={intro.title}
              onChange={(e) => setIntro({ ...intro, title: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          {(intro.sections ?? []).map((section, index) => (
            <div key={section.id || index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-900">{section.title}</p>
              <textarea
                value={section.body}
                onChange={(e) => setIntro({
                  ...intro,
                  sections: intro.sections.map((s, i) => (i === index ? { ...s, body: e.target.value } : s)),
                })}
                rows={4}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-slate-700">Offline tip</label>
            <input
              value={intro.offlineNote ?? ''}
              onChange={(e) => setIntro({ ...intro, offlineNote: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex h-9 items-center rounded-md px-4 text-xs font-bold text-white transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {saving ? 'Saving…' : 'Save intro'}
          </button>
        </div>
      )}
    </div>
  );
}