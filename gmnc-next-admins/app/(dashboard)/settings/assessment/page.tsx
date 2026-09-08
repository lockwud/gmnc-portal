'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ClipboardCheck, Plus, Save } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import {
  addToolField,
  addToolSection,
  createAdminAssessmentTool,
  deleteToolField,
  deleteToolSection,
  getAdminAssessmentTools,
  getAssessmentSettings,
  getToolDefinition,
  previewToolDefinition,
  publishToolDefinition,
  updateAssessmentSettings,
  type AssessmentSettings,
  type AssessmentToolAdminRecord,
  type ToolDefinitionDetail,
  type ToolPreview,
} from '@/lib/api/settings';

const STRATEGY_OPTIONS = ['SUM', 'WEIGHTED_SUM', 'RUBRIC', 'CUSTOM_FN_REF'] as const;
const FIELD_TYPE_OPTIONS = ['SINGLE_CHOICE', 'MULTI_CHOICE', 'SCALE_1_5', 'NUMBER', 'TEXT', 'DATE', 'BOOLEAN', 'FILE_UPLOAD'];

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
  const [newTool, setNewTool] = useState({ code: '', name: '', description: '', scoringStrategy: 'SUM' });
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [toolDetail, setToolDetail] = useState<ToolDefinitionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [preview, setPreview] = useState<ToolPreview | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newFields, setNewFields] = useState<Record<string, { fieldKey: string; label: string; fieldType: string; required: boolean; options: string }>>({});

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

  const toolOptions = useMemo(() => tools.map((tool) => tool.code), [tools]);

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
    if (!newTool.code.trim() || !newTool.name.trim()) return;
    try {
      setCreating(true);
      const tool = await createAdminAssessmentTool({
        code: newTool.code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
        name: newTool.name.trim(),
        description: newTool.description.trim() || undefined,
        scoringStrategy: newTool.scoringStrategy as 'SUM' | 'WEIGHTED_SUM' | 'RUBRIC' | 'CUSTOM_FN_REF',
        allowedProfessions: settings.providerProfessionsAllowedToAssess,
      });
      setTools((current) => [tool, ...current]);
      setSettings((current) => ({ ...current, activeAssessmentToolCodes: [...new Set([...current.activeAssessmentToolCodes, tool.code])] }));
      setNewTool({ code: '', name: '', description: '', scoringStrategy: 'SUM' });
      show({ type: 'success', title: 'Tool draft created', message: `${tool.name} is now a draft — add sections and fields, then publish.` });
    } catch (error) {
      show({ type: 'error', title: 'Create failed', message: error instanceof Error ? error.message : 'Failed to create assessment tool' });
    } finally {
      setCreating(false);
    }
  };

  const openToolDetail = async (tool: AssessmentToolAdminRecord) => {
    if (expandedToolId === tool.id) {
      setExpandedToolId(null);
      setToolDetail(null);
      setPreview(null);
      return;
    }
    try {
      setLoadingDetail(true);
      setExpandedToolId(tool.id);
      const [detail, previewData] = await Promise.all([
        getToolDefinition(tool.id),
        previewToolDefinition(tool.id).catch(() => null),
      ]);
      setToolDetail(detail);
      setPreview(previewData);
    } catch (error) {
      show({ type: 'error', title: 'Load failed', message: error instanceof Error ? error.message : 'Failed to load tool detail' });
      setExpandedToolId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshDetail = async (toolId: string) => {
    try {
      const [detail, previewData] = await Promise.all([
        getToolDefinition(toolId),
        previewToolDefinition(toolId).catch(() => null),
      ]);
      setToolDetail(detail);
      setPreview(previewData);
      setTools((current) => current.map((item) => (item.id === toolId
        ? { ...item, status: detail.status, currentVersion: detail.currentVersion ?? item.currentVersion }
        : item)));
    } catch (error) {
      show({ type: 'error', title: 'Refresh failed', message: error instanceof Error ? error.message : 'Failed to refresh tool' });
    }
  };

  const publishTool = async (tool: AssessmentToolAdminRecord) => {
    try {
      setPublishing(true);
      await publishToolDefinition(tool.id);
      await refreshDetail(tool.id);
      show({ type: 'success', title: 'Version published', message: `${tool.code} is now live for submissions. Past versions stay immutable.` });
    } catch (error) {
      show({ type: 'error', title: 'Publish failed', message: error instanceof Error ? error.message : 'Failed to publish tool' });
    } finally {
      setPublishing(false);
    }
  };

  const handleAddSection = async (toolId: string) => {
    if (!newSectionTitle.trim()) return;
    try {
      await addToolSection(toolId, { title: newSectionTitle.trim() });
      setNewSectionTitle('');
      await refreshDetail(toolId);
    } catch (error) {
      show({ type: 'error', title: 'Add section failed', message: error instanceof Error ? error.message : 'Failed to add section' });
    }
  };

  const handleAddField = async (toolId: string, sectionId: string) => {
    const draft = newFields[sectionId] ?? { fieldKey: '', label: '', fieldType: 'TEXT', required: false, options: '' };
    if (!draft.fieldKey.trim() || !draft.label.trim()) {
      show({ type: 'error', title: 'Missing field details', message: 'fieldKey and label are required. fieldKey can never change later.' });
      return;
    }
    try {
      const options = draft.options.split(',').map((entry) => entry.trim()).filter(Boolean)
        .map((value) => ({ value: value.toUpperCase().replace(/[^A-Z0-9]+/g, '_'), label: value }));
      await addToolField(toolId, sectionId, {
        fieldKey: draft.fieldKey.trim(),
        label: draft.label.trim(),
        fieldType: draft.fieldType,
        options: options.length > 0 ? options : undefined,
        validation: draft.required ? { required: true } : undefined,
      });
      setNewFields((current) => ({ ...current, [sectionId]: { fieldKey: '', label: '', fieldType: 'TEXT', required: false, options: '' } }));
      await refreshDetail(toolId);
    } catch (error) {
      show({ type: 'error', title: 'Add field failed', message: error instanceof Error ? error.message : 'Failed to add field' });
    }
  };

  const handleDeleteSection = async (toolId: string, sectionId: string) => {
    try {
      await deleteToolSection(sectionId);
      await refreshDetail(toolId);
    } catch (error) {
      show({ type: 'error', title: 'Delete failed', message: error instanceof Error ? error.message : 'Failed to delete section' });
    }
  };

  const handleDeleteField = async (toolId: string, fieldId: string) => {
    try {
      await deleteToolField(fieldId);
      await refreshDetail(toolId);
    } catch (error) {
      show({ type: 'error', title: 'Delete failed', message: error instanceof Error ? error.message : 'Failed to delete field' });
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
                  <h2 className="text-sm font-black text-slate-950">Tool Definitions</h2>
                  <p className="mt-1 text-xs text-slate-500">Draft → publish workflow. Only published versions accept submissions; publishing freezes an immutable version.</p>
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
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No tool definitions yet — create a draft below.</td>
                      </tr>
                    ) : tools.map((tool) => {
                      const professions = tool.allowedProfessions ?? [];
                      const included = settings.activeAssessmentToolCodes.includes(tool.code);
                      const expanded = expandedToolId === tool.id;
                      return (
                        <React.Fragment key={tool.id}>
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="px-4 py-3"><input type="checkbox" checked={included} onChange={() => toggleToolCode(tool.code)} className="h-4 w-4 rounded border-slate-300" style={{ accentColor: 'var(--color-brand)' }} /></td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">{tool.code}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{tool.name}</td>
                            <td className="px-4 py-3 text-slate-600">v{tool.currentVersion}{tool.status === 'DRAFT' ? ' (draft)' : ''}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{professions.length > 0 ? professions.map(formatLabel).join(', ') : 'All professions'}</td>
                            <td className="px-4 py-3"><span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${tool.status === 'PUBLISHED' ? '' : 'bg-slate-100 text-slate-500'}`} style={tool.status === 'PUBLISHED' ? { backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, white)', color: 'var(--color-brand)' } : undefined}>{tool.status}</span></td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => void openToolDetail(tool)} className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50">{expanded ? 'Close' : 'Manage'}</button>
                                <button type="button" onClick={() => void publishTool(tool)} disabled={publishing} className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Publish</button>
                              </div>
                            </td>
                          </tr>
                          {expanded ? (
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                              <td colSpan={7} className="px-4 py-4">
                                {loadingDetail || !toolDetail ? (
                                  <p className="text-xs text-slate-500">Loading tool structure…</p>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                                      <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">Scales: {(toolDetail.applicableScales ?? []).join(', ') || '—'}</span>
                                      <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">Scoring: {toolDetail.scoringStrategy}{toolDetail.customFnRef ? ` (${toolDetail.customFnRef})` : ''}</span>
                                      <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">Versions: {(toolDetail.versions ?? []).map((v) => `v${v.version}`).join(', ') || 'none published'}</span>
                                    </div>
                                    {(toolDetail.sections ?? []).map((section) => {
                                      const draft = newFields[section.id] ?? { fieldKey: '', label: '', fieldType: 'TEXT', required: false, options: '' };
                                      const setDraft = (patch: Partial<typeof draft>) => setNewFields((current) => ({ ...current, [section.id]: { ...draft, ...patch } }));
                                      return (
                                        <div key={section.id} className="rounded-md border border-slate-200 bg-white p-3">
                                          <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-black text-slate-900">{section.title} <span className="font-medium text-slate-400">· {(section.fields ?? []).length} fields</span></p>
                                            <button type="button" onClick={() => void handleDeleteSection(tool.id, section.id)} className="text-[11px] font-bold text-rose-600 hover:underline">Delete section</button>
                                          </div>
                                          <ul className="mt-2 space-y-1">
                                            {(section.fields ?? []).map((field) => (
                                              <li key={field.id} className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1.5 text-[11px]">
                                                <span className="font-mono text-slate-700">{field.fieldKey}</span>
                                                <span className="flex-1 truncate text-slate-600">{field.label}</span>
                                                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-bold text-slate-600">{field.fieldType}{field.validation && typeof field.validation === 'object' && (field.validation as Record<string, unknown>).required ? ' *' : ''}</span>
                                                <button type="button" onClick={() => void handleDeleteField(tool.id, field.id)} className="font-bold text-rose-600 hover:underline">Remove</button>
                                              </li>
                                            ))}
                                          </ul>
                                          <div className="mt-2 grid gap-2 lg:grid-cols-[140px_1fr_150px]">
                                            <input value={draft.fieldKey} onChange={(e) => setDraft({ fieldKey: e.target.value })} placeholder="fieldKey (immutable)" className="h-9 rounded-md border border-slate-200 px-2 font-mono text-xs outline-none focus:border-[var(--color-brand)]" />
                                            <input value={draft.label} onChange={(e) => setDraft({ label: e.target.value })} placeholder="Label shown to providers" className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-[var(--color-brand)]" />
                                            <select value={draft.fieldType} onChange={(e) => setDraft({ fieldType: e.target.value })} className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-[var(--color-brand)]">
                                              {FIELD_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                          </div>
                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <input value={draft.options} onChange={(e) => setDraft({ options: e.target.value })} placeholder="Choice options, comma-separated (for choice types)" className="h-9 min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-[var(--color-brand)]" />
                                            <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                              <input type="checkbox" checked={draft.required} onChange={(e) => setDraft({ required: e.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" style={{ accentColor: 'var(--color-brand)' }} /> Required
                                            </label>
                                            <button type="button" onClick={() => void handleAddField(tool.id, section.id)} className="h-9 rounded-md px-3 text-[11px] font-bold text-white" style={{ backgroundColor: 'var(--color-brand)' }}>Add field</button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <input value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="New section title" className="h-9 min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-[var(--color-brand)]" />
                                      <button type="button" onClick={() => void handleAddSection(tool.id)} className="h-9 rounded-md border border-slate-200 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Add section</button>
                                    </div>
                                    {preview ? (
                                      <div className="rounded-md border border-slate-200 bg-white p-3">
                                        <p className="text-[11px] font-black text-slate-900">Preview — {preview.published ? `published v${preview.version}` : 'unpublished draft'}</p>
                                        {(preview.sections ?? []).map((section, index) => (
                                          <div key={index} className="mt-2">
                                            <p className="text-[11px] font-bold text-slate-700">{section.sectionName}</p>
                                            <p className="text-[11px] text-slate-500">{(section.fields ?? []).map((f) => f.fieldKey).join(', ')}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
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
              <h2 className="text-sm font-black text-slate-950">Create Tool Draft</h2>
              <p className="mt-1 text-xs text-slate-500">Drafts accept no submissions until published. Publishing freezes an immutable version.</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <input value={newTool.code} onChange={(event) => setNewTool((current) => ({ ...current, code: event.target.value }))} placeholder="TOOL_CODE (UPPER_SNAKE)" className="h-10 rounded-md border border-slate-200 px-3 font-mono text-sm outline-none focus:border-[var(--color-brand)]" />
                <input value={newTool.name} onChange={(event) => setNewTool((current) => ({ ...current, name: event.target.value }))} placeholder="Tool name" className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
              </div>
              <textarea value={newTool.description} onChange={(event) => setNewTool((current) => ({ ...current, description: event.target.value }))} placeholder="Description for providers and administrators" rows={2} className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
              <div className="mt-3">
                <label className="text-xs font-bold text-slate-700">Scoring strategy</label>
                <select value={newTool.scoringStrategy} onChange={(event) => setNewTool((current) => ({ ...current, scoringStrategy: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]">
                  {STRATEGY_OPTIONS.map((strategy) => <option key={strategy} value={strategy}>{strategy}</option>)}
                </select>
              </div>
              <button type="button" onClick={createTool} disabled={creating || !newTool.code.trim() || !newTool.name.trim()} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-bold text-white transition disabled:opacity-50" style={{ backgroundColor: 'var(--color-brand)' }}><Plus className="h-4 w-4" /> {creating ? 'Creating...' : 'Create draft'}</button>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
