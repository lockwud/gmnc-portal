'use client';

import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  getAssessmentToolForm,
  getAssessmentTools,
  submitAssessment,
  warmAssessmentToolForms,
} from '@/lib/api/assessments';
import {
  AssessmentToolFormResponse,
  AssessmentToolItem,
} from '@/lib/api/types';
import AssessmentToolPicker from './AssessmentToolPicker';
import DynamicAssessmentForm from './DynamicAssessmentForms';
import {
  AssessmentFormSkeleton,
  AssessmentToolListSkeleton,
} from './AssessmentSkeletons';
import { draftStorageKey } from '@/utils/assessment';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/lib/context/AuthContext';

export default function AssessmentCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = useMemo(() => {
    return (
      user?.userType?.toUpperCase() === 'ADMIN' ||
      user?.roles?.some((role) => role.toUpperCase() === 'ADMIN')
    );
  }, [user?.roles, user?.userType]);

  // --- State hooks (missing in original code) ---
  const [tools, setTools] = useState<AssessmentToolItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<AssessmentToolItem | null>(null);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [toolPage, setToolPage] = useState(1);
  const toolPageSize = 8;

  const [formSchema, setFormSchema] = useState<AssessmentToolFormResponse | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const patientId = searchParams.get('patientId') || '';
  const patientName = searchParams.get('patientName') || '';
  const patientGender = searchParams.get('patientGender') || '';
  const patientDob = searchParams.get('patientDob') || '';
  const caregiverName = searchParams.get('caregiverName') || '';

  useEffect(() => {
    let active = true;

    async function loadTools() {
      try {
        setLoadingTools(true);
        setToolsError(null);
        const data = await getAssessmentTools();
        if (!active) return;

        const availableTools = (data.tools || []).filter((tool) => {
          if (isAdmin) {
            return true;
          }
          return tool.canCurrentUserUse;
        });

        setTools(availableTools);
        setSelectedTool((current) => {
          if (current && availableTools.some((tool) => tool.toolCode === current.toolCode)) {
            return current;
          }
          return availableTools[0] ?? null;
        });

        if (availableTools.length > 0) {
          startTransition(() => {
            void warmAssessmentToolForms(availableTools.map((tool) => tool.toolCode));
          });
        }
      } catch (err) {
        if (!active) return;
        setToolsError(err instanceof Error ? err.message : 'Failed to load assessment tools.');
      } finally {
        if (active) setLoadingTools(false);
      }
    }

    loadTools();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let active = true;

    async function loadSchema() {
      if (!selectedTool?.toolCode) {
        setFormSchema(null);
        return;
      }

      try {
        setLoadingSchema(true);
        setSchemaError(null);
        const data = await getAssessmentToolForm(selectedTool.toolCode);
        if (!active) return;
        setFormSchema(data);

        if (patientId) {
          const saved = window.localStorage.getItem(
            draftStorageKey(patientId, selectedTool.toolCode)
          );
          if (saved) {
            try {
              setValues(JSON.parse(saved));
            } catch {
              setValues({});
            }
          } else {
            setValues({});
          }
        } else {
          setValues({});
        }
      } catch (err) {
        if (!active) return;
        setSchemaError(err instanceof Error ? err.message : 'Failed to load assessment form.');
      } finally {
        if (active) setLoadingSchema(false);
      }
    }

    loadSchema();
    return () => {
      active = false;
    };
  }, [selectedTool, patientId]);

  const canSubmit = useMemo(() => {
    return Boolean(patientId && selectedTool?.toolCode && formSchema);
  }, [patientId, selectedTool, formSchema]);

  const totalToolPages = Math.max(1, Math.ceil(tools.length / toolPageSize));
  const currentToolPage = Math.min(toolPage, totalToolPages);

  const visibleTools = useMemo(() => {
    const start = (currentToolPage - 1) * toolPageSize;
    return tools.slice(start, start + toolPageSize);
  }, [currentToolPage, tools]);

  const handleSelectTool = (tool: AssessmentToolItem) => {
    const selectedIndex = tools.findIndex((item) => item.toolCode === tool.toolCode);

    if (selectedIndex !== -1) {
      setToolPage(Math.floor(selectedIndex / toolPageSize) + 1);
    }

    setSelectedTool(tool);
    setSubmitError(null);
  };

  const handleFieldChange = (fieldKey: string, nextValue: unknown) => {
    setValues((prev) => ({
      ...prev,
      [fieldKey]: nextValue,
    }));
  };

  const handleSaveLocal = () => {
    if (!patientId || !selectedTool?.toolCode) return;
    window.localStorage.setItem(
      draftStorageKey(patientId, selectedTool.toolCode),
      JSON.stringify(values)
    );
  };

  const handleClearLocal = () => {
    if (!patientId || !selectedTool?.toolCode) return;
    window.localStorage.removeItem(draftStorageKey(patientId, selectedTool.toolCode));
    setValues({});
  };

  const handleSubmit = async () => {
    if (!patientId || !selectedTool?.toolCode) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const GMFM_DIMENSIONS = [
        { code: 'A', start: 1, end: 17 },
        { code: 'B', start: 18, end: 37 },
        { code: 'C', start: 38, end: 51 },
        { code: 'D', start: 52, end: 64 },
        { code: 'E', start: 65, end: 88 },
      ];

      const allGMFMKeys: string[] = [];
      GMFM_DIMENSIONS.forEach(({ code, start, end }) => {
        for (let i = start; i <= end; i++) {
          allGMFMKeys.push(`${code}${i}`);
        }
      });

      const existingResponses = (values as Record<string, string | number | boolean>);
      const sanitizedResponses: Record<string, string | number> = {};
      allGMFMKeys.forEach((key) => {
        const raw = existingResponses[key];
        if (raw === undefined || raw === null || raw === '') {
          sanitizedResponses[key] = '';
        } else if (raw === 'NT' || raw === 'nt') {
          sanitizedResponses[key] = 'NT';
        } else {
          const num = typeof raw === 'number' ? raw : Number(raw);
          sanitizedResponses[key] = Number.isNaN(num) ? '' : num;
        }
      });

      const isRegularPerformance = existingResponses['isRegularPerformance'] as boolean | undefined;
      const clinicalNotesComment =
        (existingResponses['clinicalNotesComment'] as string | undefined) ??
        (existingResponses['clinical_notes_comment'] as string | undefined) ??
        '';

      const result = await submitAssessment({
        patientId,
        toolCode: selectedTool.toolCode,
        status: 'COMPLETED',
        responses: sanitizedResponses,
        isRegularPerformance,
        clinicalNotesComment,
      });

      window.localStorage.removeItem(draftStorageKey(patientId, selectedTool.toolCode));
      const params = new URLSearchParams();
      if (result.assessment.toolCode) params.set('toolCode', result.assessment.toolCode);
      if (result.assessment.status) params.set('status', result.assessment.status);
      if (result.assessment.assessedAt) params.set('assessedAt', result.assessment.assessedAt);
      if (patientName) params.set('patientName', patientName);
      if (patientGender) params.set('patientGender', patientGender);
      if (patientDob) params.set('patientDob', patientDob);
      if (caregiverName) params.set('caregiverName', caregiverName);
      if (user?.fullName || user?.name) params.set('assessedByName', user.fullName || user.name || '');
      const query = params.toString();
      router.push(`/provider/assessments/${result.assessment.id}/report${query ? `?${query}` : ''}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!patientId) {
    return (
      <div className="flex h-[calc(100vh-110px)] items-center justify-center bg-white">
        <EmptyState
          title="Patient context required"
          description="Start a new assessment from a patient profile so the correct patient is preselected."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-slate-50">
      <aside className="hidden w-82.5 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="shrink-0 border-b border-slate-200 px-4 py-4">
          <h1 className="text-[15px] font-semibold text-slate-900">Create Assessment</h1>
          <p className="mt-1 text-xs text-slate-500">
            Choose a tool, complete the form, then submit the assessment.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scrollbar-none">
          {loadingTools ? (
            <AssessmentToolListSkeleton />
          ) : toolsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {toolsError}
            </div>
          ) : tools.length === 0 ? (
            <EmptyState
              title="No tools available"
              description="No compatible assessment tools are available for your profession."
            />
          ) : (
            <AssessmentToolPicker
              tools={visibleTools}
              selectedToolCode={selectedTool?.toolCode}
              onSelect={handleSelectTool}
              canUseRestrictedTools={isAdmin}
            />
          )}
        </div>

        {!loadingTools && !toolsError && tools.length > 0 ? (
          <div className="shrink-0 border-t border-slate-200 bg-white">
            <Pagination
              page={currentToolPage}
              totalPages={totalToolPages}
              pageSize={toolPageSize}
              totalItems={tools.length}
              onPageChange={setToolPage}
            />
          </div>
        ) : null}
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </Button>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
                  Patient: {patientName || patientId}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Submit when complete. Scores and clinical notes are generated immediately.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveLocal}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden className="text-amber-600">
                  <path
                    d="M5 5h11l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 5v6h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Save locally
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleClearLocal}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden className="text-red-600">
                  <path
                    d="M3 6h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 6l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Clear
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
          <div className="mx-auto flex h-full max-w-6xl min-h-0 flex-col gap-4">
            <div className="shrink-0 lg:hidden">
              {loadingTools ? (
                <AssessmentToolListSkeleton count={3} />
              ) : toolsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {toolsError}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-64 overflow-y-auto overflow-x-hidden scrollbar-none">
                    <AssessmentToolPicker
                      tools={visibleTools}
                      selectedToolCode={selectedTool?.toolCode}
                      onSelect={handleSelectTool}
                      canUseRestrictedTools={isAdmin}
                    />
                  </div>

                  {tools.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white">
                      <Pagination
                        page={currentToolPage}
                        totalPages={totalToolPages}
                        pageSize={toolPageSize}
                        totalItems={tools.length}
                        onPageChange={setToolPage}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {submitError ? (
              <div className="shrink-0 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-none">
              {!selectedTool ? (
                <EmptyState
                  title="Select an assessment tool"
                  description="Choose the most appropriate tool for this patient to begin the assessment."
                />
              ) : loadingSchema ? (
                <AssessmentFormSkeleton count={5} />
              ) : schemaError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {schemaError}
                </div>
              ) : formSchema ? (
                <DynamicAssessmentForm
                  schema={formSchema}
                  values={values}
                  onFieldChange={handleFieldChange}
                />
              ) : (
                <EmptyState
                  title="No form available"
                  description="The selected tool has no renderable form schema."
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
