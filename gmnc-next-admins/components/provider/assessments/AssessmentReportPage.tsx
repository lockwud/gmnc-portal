'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardList,
  FileText,
  Gauge,
  Layers3,
  Lightbulb,
  Percent,
  Printer,
  ShieldCheck,
  UserCheck,
  UsersRound,
  UserRound,
} from 'lucide-react';
import { getAssessmentReport } from '@/lib/api/assessments';
import { generateCarePlan, listCarePlans } from '@/lib/api/care-plans';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import type { AssessmentReportResponse } from '@/lib/api/types';

function getStatusClass(status?: string | null) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'REVIEWED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatLabel(value: string) {
  const label = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (label.length <= 6 && /^[a-z0-9]+$/i.test(label)) {
    return label.toUpperCase();
  }

  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  return JSON.stringify(value, null, 2);
}

function getPercent(value: unknown) {
  if (typeof value !== 'number' || value < 0 || value > 100) return null;
  return value;
}

function nestedRecord(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return isRecord(value) ? value : null;
}

function stringValue(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function ScoreIcon({ scoreKey }: { scoreKey: string }) {
  const normalized = scoreKey.toLowerCase();

  if (normalized.includes('total') || normalized.includes('gmfm')) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-100">
        <Gauge className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }

  if (normalized.includes('percent')) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <Percent className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }

  if (normalized.includes('dimension') || normalized.includes('profile')) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Layers3 className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
      <CircleDot className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function ScoreValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1 text-sm text-slate-600">
        {value.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="min-w-0 break-words">{isRecord(item) || Array.isArray(item) ? formatValue(item) : formatValue(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (isRecord(value)) {
    return (
      <div className={depth === 0 ? 'grid gap-2 md:grid-cols-3' : 'space-y-2'}>
        {Object.entries(value).map(([key, nestedValue]) => {
          const profileRecord = isRecord(nestedValue) ? nestedValue : null;
          const profileName = typeof (profileRecord as Record<string, unknown> | null)?.['name'] === 'string'
            ? (profileRecord as Record<string, unknown>)['name'] as string
            : null;
          const label = profileName && /^[A-Z]$/.test(key) ? profileName : formatLabel(key);

          return (
            <div
              key={key}
              className="rounded-lg border border-slate-200 bg-white p-2.5"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </span>
                {!isRecord(nestedValue) && !Array.isArray(nestedValue) ? (
                  <span className="text-sm font-semibold text-purple-700">{formatValue(nestedValue)}</span>
                ) : null}
              </div>
              {isRecord(nestedValue) || Array.isArray(nestedValue) ? (
                <ScoreValue value={nestedValue} depth={depth + 1} />
              ) : (
                <ScoreMeter value={nestedValue} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-sm font-semibold text-purple-700">{formatValue(value)}</span>;
}

function ScoreBreakdown({
  scores,
  openKeys,
  onToggle,
}: {
  scores: Record<string, unknown>;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {Object.entries(scores).map(([key, value]) => {
        const hasDetails = isRecord(value) || Array.isArray(value);
        const open = openKeys.has(key);

        return (
          <div key={key} className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => hasDetails && onToggle(key)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              aria-expanded={hasDetails ? open : undefined}
            >
              <span className="flex min-w-0 items-center gap-2">
                <ScoreIcon scoreKey={key} />
                <span className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {formatLabel(key)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {!hasDetails ? (
                  <span className="text-sm font-semibold text-purple-700">{formatValue(value)}</span>
                ) : null}
                {hasDetails ? (
                  open ? (
                    <ChevronDown className="h-4 w-4 text-purple-600" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-purple-600" aria-hidden />
                  )
                ) : null}
              </span>
            </button>

            {!hasDetails ? (
              <div className="px-3 pb-3">
                <ScoreMeter value={value} />
              </div>
            ) : open ? (
              <div className="max-h-72 overflow-y-auto border-t border-slate-100 bg-slate-50 p-3 scrollbar-none">
                <ScoreValue value={value} depth={1} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ScoreMeter({ value }: { value: unknown }) {
  const percent = getPercent(value);

  if (percent === null) return null;

  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-purple-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Recommendations({ value }: { value: unknown }) {
  if (typeof value === 'string') {
    return (
      <div className="space-y-2">
        {value.split(/\n+/).filter(Boolean).map((item, index) => (
          <p key={index} className="text-sm leading-6 text-slate-700">{item}</p>
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-3">
        {value.map((rec, index) => (
          <li key={index} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
              {index + 1}
            </span>
            <span className="min-w-0 break-words">{formatValue(rec)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
      {formatValue(value)}
    </pre>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-current/10">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

export default function AssessmentReportPage({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { show } = useToast();
  const [report, setReport] = useState<AssessmentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingCarePlan, setGeneratingCarePlan] = useState(false);
  const [checkingCarePlan, setCheckingCarePlan] = useState(false);
  const [hasActiveCarePlan, setHasActiveCarePlan] = useState(false);
  const [openScoreKeys, setOpenScoreKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    async function load() {
      if (!assessmentId) {
        setError('Assessment id is missing.');
        setLoading(false);
        return;
      }

      try {
        const reportData = await getAssessmentReport(assessmentId);
        if (!active) return;
        setReport(reportData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load assessment report.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [assessmentId]);

  const reportRecord = report as (AssessmentReportResponse & Record<string, unknown>) | null;
  const assessmentRecord =
    reportRecord && typeof reportRecord.assessment === 'object' && reportRecord.assessment !== null
      ? reportRecord.assessment as Record<string, unknown>
      : null;
  const patientRecord =
    nestedRecord(reportRecord, 'patient') ||
    nestedRecord(assessmentRecord, 'patient') ||
    nestedRecord(reportRecord, 'cpPatient') ||
    nestedRecord(assessmentRecord, 'cpPatient');
  const caregiverRecord =
    nestedRecord(patientRecord, 'caregiver') ||
    nestedRecord(reportRecord, 'caregiver') ||
    nestedRecord(assessmentRecord, 'caregiver');
  const providerRecord =
    nestedRecord(reportRecord, 'provider') ||
    nestedRecord(assessmentRecord, 'provider') ||
    nestedRecord(reportRecord, 'serviceProvider') ||
    nestedRecord(assessmentRecord, 'serviceProvider');
  const providerUserRecord =
    nestedRecord(providerRecord, 'user') ||
    nestedRecord(reportRecord, 'assessedBy') ||
    nestedRecord(assessmentRecord, 'assessedBy');
  const toolCode =
    searchParams?.get('toolCode') ||
    (typeof assessmentRecord?.toolCode === 'string' ? assessmentRecord.toolCode : null) ||
    (typeof reportRecord?.toolCode === 'string' ? reportRecord.toolCode : null) ||
    'Assessment Report';
  const status =
    searchParams?.get('status') ||
    (typeof assessmentRecord?.status === 'string' ? assessmentRecord.status : null) ||
    (typeof reportRecord?.status === 'string' ? reportRecord.status : null) ||
    'COMPLETED';
  const canGenerateCarePlan = ['COMPLETED', 'APPROVED'].includes(status.toUpperCase());
  const assessedAt =
    searchParams?.get('assessedAt') ||
    (typeof assessmentRecord?.assessedAt === 'string' ? assessmentRecord.assessedAt : null) ||
    (typeof reportRecord?.assessedAt === 'string' ? reportRecord.assessedAt : null);
  const patientName =
    searchParams?.get('patientName') ||
    stringValue(patientRecord, 'fullName') ||
    stringValue(patientRecord, 'name') ||
    stringValue(assessmentRecord, 'patientName') ||
    stringValue(reportRecord, 'patientName') ||
    'Patient';
  const patientId =
    stringValue(patientRecord, 'id') ||
    stringValue(assessmentRecord, 'patientId') ||
    stringValue(reportRecord, 'patientId') ||
    undefined;
  const patientGender =
    searchParams?.get('patientGender') ||
    stringValue(patientRecord, 'gender') ||
    stringValue(assessmentRecord, 'patientGender') ||
    stringValue(reportRecord, 'patientGender');
  const patientDob =
    searchParams?.get('patientDob') ||
    stringValue(patientRecord, 'dateOfBirth') ||
    stringValue(patientRecord, 'dob') ||
    stringValue(assessmentRecord, 'patientDob') ||
    stringValue(assessmentRecord, 'dateOfBirth') ||
    stringValue(reportRecord, 'patientDob') ||
    stringValue(reportRecord, 'dateOfBirth');
  const caregiverName =
    searchParams?.get('caregiverName') ||
    stringValue(caregiverRecord, 'fullName') ||
    stringValue(caregiverRecord, 'name') ||
    stringValue(assessmentRecord, 'caregiverName') ||
    stringValue(reportRecord, 'caregiverName');
  const assessedByName =
    searchParams?.get('assessedByName') ||
    stringValue(providerUserRecord, 'fullName') ||
    stringValue(providerUserRecord, 'name') ||
    stringValue(providerRecord, 'fullName') ||
    stringValue(providerRecord, 'name') ||
    stringValue(assessmentRecord, 'assessedByName') ||
    stringValue(reportRecord, 'assessedByName') ||
    stringValue(assessmentRecord, 'providerName') ||
    stringValue(reportRecord, 'providerName') ||
    null;
  const patientAge = patientDob ? (() => {
    const dob = new Date(patientDob);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
    return age;
  })() : null;
  const assessedByRole = stringValue(providerUserRecord, 'role') || stringValue(providerRecord, 'role');
  const assessedByProfession = stringValue(providerRecord, 'profession');
  const patientDetails = [
    patientAge != null ? `${patientAge} yrs` : null,
    patientGender ? formatLabel(patientGender) : null,
  ].filter(Boolean);
  const scores = report?.report.scores ?? {};
  const scoreEntries = Object.entries(scores);
  const headlineScore = scoreEntries.find(([key, value]) =>
    typeof value === 'number' && /total|score|percent/i.test(key)
  );
  const toggleScoreKey = (key: string) => {
    setOpenScoreKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!patientId || !token) {
      return;
    }

    let active = true;
    async function checkActiveCarePlan() {
      try {
        setCheckingCarePlan(true);
        const plans = await listCarePlans(patientId, token);
        if (!active) return;
        setHasActiveCarePlan(plans.some((plan) => plan.status === 'ACTIVE'));
      } catch {
        if (active) setHasActiveCarePlan(false);
      } finally {
        if (active) setCheckingCarePlan(false);
      }
    }

    void checkActiveCarePlan();
    return () => {
      active = false;
    };
  }, [patientId, token]);

  const handleGenerateCarePlan = async () => {
    if (hasActiveCarePlan) return;
    try {
      setGeneratingCarePlan(true);
      await generateCarePlan(assessmentId, token);
      setHasActiveCarePlan(true);
      show({
        type: 'success',
        title: 'Care plan ready',
        message: 'The care plan has been generated from this assessment.',
        duration: 3500,
      });
      router.push('/provider/care-plans');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate care plan.';
      show({ type: 'error', title: 'Care plan failed', message, duration: 4500 });
    } finally {
      setGeneratingCarePlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-76px)] items-center justify-center bg-white">
        <div className="text-sm text-slate-500">Loading assessment report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-76px)] items-center justify-center bg-white">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-[calc(100vh-76px)] items-center justify-center bg-white">
        <div className="text-sm text-slate-500">Assessment not found.</div>
      </div>
    );
  }

  return (
    <div className="assessment-report-root flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 print:hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/provider/assessments')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
              aria-label="Back to assessments"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-slate-900">{toolCode}</h1>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(status)}`}>
                {status}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
              <UserRound className="h-4 w-4" aria-hidden />
              <span className="max-w-[220px] truncate">{patientName}</span>
              {patientAge != null ? <span className="text-blue-500">• {patientAge} yrs</span> : null}
              {patientGender ? <span className="text-blue-500">• {formatLabel(patientGender)}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-500">
              Assessed: {assessedAt ? new Date(assessedAt).toLocaleString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '—'}
            </div>
            {canGenerateCarePlan ? (
              <button
                type="button"
                onClick={handleGenerateCarePlan}
                disabled={generatingCarePlan || checkingCarePlan || hasActiveCarePlan}
                title={hasActiveCarePlan ? 'An active care plan already exists for this patient.' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${hasActiveCarePlan
                  ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'
                }`}
              >
                <ClipboardList className="h-4 w-4" aria-hidden />
                {hasActiveCarePlan ? 'Active Care Plan' : checkingCarePlan ? 'Checking...' : generatingCarePlan ? 'Generating...' : 'Generate Care Plan'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-auto bg-slate-50 px-4 py-6 scrollbar-none print:hidden">
        <div className="mx-auto w-full max-w-[min(96rem,calc(100vw-3rem))] space-y-5">
          <div className="hidden print:block">
            <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{toolCode}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Patient: {patientName}
                  {patientAge != null ? ` • ${patientAge} yrs` : ''}
                  {patientGender ? ` • ${formatLabel(patientGender)}` : ''}
                </p>
                {caregiverName ? <p className="text-sm text-slate-600">Caregiver: {caregiverName}</p> : null}
              </div>
              <div className="text-right text-sm text-slate-600">
                <div>{status}</div>
                <div>{assessedAt ? new Date(assessedAt).toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700">
                    <FileText className="h-4 w-4" aria-hidden />
                    Clinical Summary
                  </div>
                  <p className="mt-3 text-base leading-7 text-slate-800">
                    {report.report.summary || 'No summary available.'}
                  </p>
                </div>

                {headlineScore ? (
                  <div className="shrink-0 text-center">
                    <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 shadow-sm">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
                        <Gauge className="h-3.5 w-3.5" aria-hidden />
                        {formatLabel(headlineScore[0])}
                      </div>
                    </div>
                    <div className="-mt-1 inline-flex rounded-full border border-amber-100 bg-amber-50/90 px-3 py-1 text-sm font-semibold text-amber-800 shadow-sm backdrop-blur">
                      {formatValue(headlineScore[1])}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {report.report.interpretation ? (
              <div className="px-5 py-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Activity className="h-4 w-4 text-blue-600" aria-hidden />
                  Interpretation
                </div>
                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                  {report.report.interpretation}
                </p>
              </div>
            ) : null}
          </section>

          {scoreEntries.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <BarChart3 className="h-4 w-4 text-purple-600" aria-hidden />
                    Scores
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Domain and computed score breakdown from this assessment.
                  </p>
                </div>
              </div>

              <ScoreBreakdown
                scores={scores}
                openKeys={openScoreKeys}
                onToggle={toggleScoreKey}
              />
            </section>
          )}

          {Boolean(report.report.recommendations) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                Recommendations
              </div>
              <Recommendations value={report.report.recommendations} />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList className="h-4 w-4 text-slate-500" aria-hidden />
              Assessment Details
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-4 text-sm md:grid-cols-3 lg:grid-cols-5">
              <DetailTile
                icon={UserRound}
                label="Patient"
                value={patientName}
                className="text-blue-700"
              />
              {patientDetails.length > 0 ? (
                <DetailTile
                  icon={UsersRound}
                  label="Patient Details"
                  value={patientDetails.join(' • ')}
                  className="text-purple-700"
                />
              ) : null}
              <DetailTile
                icon={ShieldCheck}
                label="Status"
                value={status}
                className="text-emerald-700"
              />
              <DetailTile
                icon={CalendarClock}
                label="Assessed"
                value={assessedAt ? new Date(assessedAt).toLocaleString() : '—'}
                className="text-amber-700"
              />
              {caregiverName ? (
                <DetailTile
                  icon={UsersRound}
                  label="Caregiver"
                  value={caregiverName}
                  className="text-rose-700"
                />
              ) : null}
              {assessedByName ? (
                <DetailTile
                  icon={UserCheck}
                  label="Assessed By"
                  value={assessedByRole === 'ADMIN'
                    ? `${assessedByName} (${assessedByRole})`
                    : assessedByProfession
                      ? `${assessedByName} (${assessedByProfession})`
                      : assessedByName
                  }
                  className="text-cyan-700"
                />
              ) : null}
            </dl>
          </section>
        </div>
      </main>

      <div className="assessment-report-print hidden bg-white text-slate-950 print:block">
        <section className="print-page">
          <div className="mb-5 flex items-start justify-between border-b border-slate-300 pb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Get My Neuro Care
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">{toolCode}</h1>
              <p className="mt-1 text-sm text-slate-600">Clinical assessment report</p>
            </div>
            {headlineScore ? (
              <div className="text-right">
                <div className="inline-flex rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
                  {formatLabel(headlineScore[0])}
                </div>
                <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-base font-semibold text-amber-900">
                  {formatValue(headlineScore[1])}
                </div>
              </div>
            ) : null}
          </div>

          <div className="print-avoid-break mb-5 rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <UserRound className="h-4 w-4 text-blue-600" aria-hidden />
              Patient Information
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient</dt>
                <dd className="mt-1 font-semibold text-slate-950">{patientName}</dd>
              </div>
              {patientDetails.length > 0 ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient Details</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{patientDetails.join(' • ')}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                <dd className="mt-1 font-semibold text-slate-950">{status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessed</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {assessedAt ? new Date(assessedAt).toLocaleString() : '—'}
                </dd>
              </div>
              {caregiverName ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Caregiver</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{caregiverName}</dd>
                </div>
              ) : null}
              {assessedByName ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessed By</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {assessedByRole === 'ADMIN'
                      ? `${assessedByName} (${assessedByRole})`
                      : assessedByProfession
                        ? `${assessedByName} (${assessedByProfession})`
                        : assessedByName
                    }
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="print-avoid-break mb-5 rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <FileText className="h-4 w-4 text-emerald-600" aria-hidden />
              Summary
            </div>
            <p className="text-sm leading-7 text-slate-800">
              {report.report.summary || 'No summary available.'}
            </p>
          </div>

          {report.report.interpretation ? (
            <div className="print-avoid-break rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Activity className="h-4 w-4 text-blue-600" aria-hidden />
                Interpretation
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                {report.report.interpretation}
              </p>
            </div>
          ) : null}
        </section>

        <section className="print-page">
          {scoreEntries.length > 0 ? (
            <div className="mb-5 rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <BarChart3 className="h-4 w-4 text-purple-600" aria-hidden />
                Detailed Scores
              </div>
              <ScoreValue value={scores} />
            </div>
          ) : null}

          {Boolean(report.report.recommendations) ? (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                Recommendations
              </div>
              <Recommendations value={report.report.recommendations} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
