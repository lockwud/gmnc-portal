'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ClipboardCheck, Plus, Save } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import {
  createAdminAssessmentTool,
  getAdminAssessmentTools,
  getAssessmentSettings,
  updateAdminAssessmentTool,
  updateAssessmentSettings,
  type AssessmentSettings,
  type AssessmentToolAdminRecord,
} from '@/lib/api/settings';

const PROFESSION_OPTIONS = [
  'PHYSIOTHERAPIST',
  'OCCUPATIONAL_THERAPIST',
  'SPEECH_THERAPIST',
  'CLINICAL_PSYCHOLOGIST',
  'DIETITIAN',
  'PHARMACIST',
  'GENERAL_PAEDIATRICIAN',
  'PAEDIATRIC_NEUROLOGIST',
];

const DEFAULT_ASSESSMENT_SETTINGS: AssessmentSettings = {
  enableAssessmentModule: true,
  requireCompletedReferralForAssessment: false,
  allowDraftAssessments: true,
  allowAssessmentResubmission: true,
  requireClinicalNotesOnSubmit: true,
  requireRegularPerformanceConfirmation: true,
  autoGenerateReportOnSubmit: true,
  defaultToolVersion: '1.0',
  activeAssessmentToolCodes: ['PAEDIATRIC_PHYSIOTHERAPY_ASSESSMENT', 'OT_CP_CLINICAL_ASSESSMENT'],
  providerProfessionsAllowedToAssess: ['PHYSIOTHERAPIST', 'OCCUPATIONAL_THERAPIST'],
  mobileAssessmentInstructions: 'Complete assessments using clinically observed or caregiver-confirmed performance data.',
};

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? '' : 'bg-slate-200'}`}
      style={checked ? { backgroundColor: 'var(--color-brand)' } : undefined}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

export default function AssessmentSettingsRoute() {
  const { show } = useToast();
  const [settings, setSettings] = useState<AssessmentSettings>(DEFAULT_ASSESSMENT_SETTINGS);
  const [tools, setTools] = useState<AssessmentToolAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTool, setNewTool] = useState({ toolCode: '', toolName: '', version: '1.0', description: '' });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [settingsData, toolsData] = await Promise.all([
          getAssessmentSettings().catch(() => DEFAULT_ASSESSMENT_SETTINGS),
          getAdminAssessmentTools(),
        ]);
        if (!active) return;
        setSettings({ ...DEFAULT_ASSESSMENT_SETTINGS, ...settingsData });
        setTools(toolsData);
      } catch (error) {
        show({ type: 'error', title: 'Settings unavailable', message: error instanceof Error ? error.message : 'Failed to load assessment settings' });
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [show]);

  const toolOptions = useMemo(() => tools.map((tool) => tool.toolCode), [tools]);

  const toggleToolCode = (toolCode: string) => {
    setSettings((current) => ({
      ...current,
      activeAssessmentToolCodes: current.activeAssessmentToolCodes.includes(toolCode)
        ? current.activeAssessmentToolCodes.filter((code) => code !== toolCode)
        : [...current.activeAssessmentToolCodes, toolCode],
    }));
  };

  const toggleProfession = (profession: string) => {
    setSettings((current) => ({
      ...current,
      providerProfessionsAllowedToAssess: current.providerProfessionsAllowedToAssess.includes(profession)
        ? current.providerProfessionsAllowedToAssess.filter((item) => item !== profession)
        : [...current.providerProfessionsAllowedToAssess, profession],
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const saved = await updateAssessmentSettings(settings);
      setSettings({ ...DEFAULT_ASSESSMENT_SETTINGS, ...saved });
      show({ type: 'success', title: 'Assessment settings saved', message: 'Provider and mobile assessment workflow settings were updated.' });
    } catch (error) {
      show({ type: 'error', title: 'Save failed', message: error instanceof Error ? error.message : 'Failed to save assessment settings' });
    } finally {
      setSaving(false);
    }
  };

  const createTool = async () => {
    if (!newTool.toolCode.trim() || !newTool.toolName.trim()) return;
    try {
      setCreating(true);
      const tool = await createAdminAssessmentTool({
        toolCode: newTool.toolCode.trim().toUpperCase().replace(/\s+/g, '_'),
        toolName: newTool.toolName.trim(),
        version: newTool.version.trim() || '1.0',
        description: newTool.description.trim() || undefined,
        professions: settings.providerProfessionsAllowedToAssess,
      });
      setTools((current) => [tool, ...current]);
      setSettings((current) => ({ ...current, activeAssessmentToolCodes: [...new Set([...current.activeAssessmentToolCodes, tool.toolCode])] }));
      setNewTool({ toolCode: '', toolName: '', version: '1.0', description: '' });
      show({ type: 'success', title: 'Assessment tool created', message: `${tool.toolName} is now available for configuration.` });
    } catch (error) {
      show({ type: 'error', title: 'Create failed', message: error instanceof Error ? error.message : 'Failed to create assessment tool' });
    } finally {
      setCreating(false);
    }
  };

  const toggleToolActive = async (tool: AssessmentToolAdminRecord) => {
    try {
      const updated = await updateAdminAssessmentTool(tool.id, { isActive: !tool.isActive });
      setTools((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      show({ type: 'error', title: 'Update failed', message: error instanceof Error ? error.message : 'Failed to update tool' });
    }
  };

  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <button type="button" onClick={saveSettings} disabled={saving || loading} className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white shadow-sm transition disabled:opacity-60" style={{ backgroundColor: 'var(--color-brand)' }}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save settings'}
          </button>
        </header>

        <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600"><ClipboardCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-sm font-black text-slate-950">Mobile Rules</h2>
                <p className="text-xs text-slate-500">Rules providers and caregivers experience.</p>
              </div>
            </div>
            {loading ? <p className="text-sm text-slate-500">Loading...</p> : (
              <div className="space-y-4">
                {[
                  ['enableAssessmentModule', 'Enable assessment module'],
                  ['requireCompletedReferralForAssessment', 'Require completed referral'],
                  ['allowDraftAssessments', 'Allow draft assessments'],
                  ['allowAssessmentResubmission', 'Allow resubmission'],
                  ['requireClinicalNotesOnSubmit', 'Require clinical notes'],
                  ['requireRegularPerformanceConfirmation', 'Require regular-performance confirmation'],
                  ['autoGenerateReportOnSubmit', 'Auto-generate report'],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                    <Toggle checked={Boolean(settings[key as keyof AssessmentSettings])} onChange={(checked) => setSettings((current) => ({ ...current, [key]: checked }))} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-700">Default tool version</label>
                  <input value={settings.defaultToolVersion} onChange={(event) => setSettings((current) => ({ ...current, defaultToolVersion: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Mobile assessment instructions</label>
                  <textarea value={settings.mobileAssessmentInstructions} onChange={(event) => setSettings((current) => ({ ...current, mobileAssessmentInstructions: event.target.value }))} rows={4} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
                </div>
              </div>
            )}
          </aside>

          <main className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <section className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-slate-950">Code Settings</h2>
                  <p className="mt-1 text-xs text-slate-500">Manage assessment tool codes used in provider workflows and mobile-facing reports.</p>
                </div>
                <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{toolOptions.length} configured</span>
              </div>
              <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead className="text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Workflow</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Version</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Professions</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No assessment tool codes configured yet.</td>
                      </tr>
                    ) : tools.map((tool) => {
                      const professions = tool.professions?.map((profession) => typeof profession === 'string' ? profession : profession.profession).filter(Boolean) ?? [];
                      const included = settings.activeAssessmentToolCodes.includes(tool.toolCode);
                      return (
                        <tr key={tool.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3"><input type="checkbox" checked={included} onChange={() => toggleToolCode(tool.toolCode)} className="h-4 w-4 rounded border-slate-300" style={{ accentColor: 'var(--color-brand)' }} /></td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{tool.toolCode}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{tool.toolName}</td>
                          <td className="px-4 py-3 text-slate-600">{tool.version}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{professions.length > 0 ? professions.map(formatLabel).join(', ') : 'Uses allowed professions'}</td>
                          <td className="px-4 py-3"><span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${tool.isActive ? '' : 'bg-slate-100 text-slate-500'}`} style={tool.isActive ? { backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, white)', color: 'var(--color-brand)' } : undefined}>{tool.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-4 py-3 text-right"><button type="button" onClick={() => void toggleToolActive(tool)} className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50">{tool.isActive ? 'Deactivate' : 'Activate'}</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-sm font-black text-slate-950">Provider Professions Allowed To Assess</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {PROFESSION_OPTIONS.map((profession) => (
                  <button key={profession} type="button" onClick={() => toggleProfession(profession)} className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${settings.providerProfessionsAllowedToAssess.includes(profession) ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} style={settings.providerProfessionsAllowedToAssess.includes(profession) ? { backgroundColor: 'var(--color-brand)' } : undefined}>
                    {formatLabel(profession)}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-black text-slate-950">Create Assessment Tool Code</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_120px]">
                <input value={newTool.toolCode} onChange={(event) => setNewTool((current) => ({ ...current, toolCode: event.target.value }))} placeholder="TOOL_CODE" className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
                <input value={newTool.toolName} onChange={(event) => setNewTool((current) => ({ ...current, toolName: event.target.value }))} placeholder="Tool name" className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
                <input value={newTool.version} onChange={(event) => setNewTool((current) => ({ ...current, version: event.target.value }))} placeholder="1.0" className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
              </div>
              <textarea value={newTool.description} onChange={(event) => setNewTool((current) => ({ ...current, description: event.target.value }))} placeholder="Description for providers and administrators" rows={2} className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
              <button type="button" onClick={createTool} disabled={creating || !newTool.toolCode.trim() || !newTool.toolName.trim()} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-bold text-white transition disabled:opacity-50" style={{ backgroundColor: 'var(--color-brand)' }}><Plus className="h-4 w-4" /> {creating ? 'Creating...' : 'Create tool'}</button>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
