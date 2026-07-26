'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { getPatientAssessments, getAssessmentReport } from '@/lib/api/assessments';
import type { AssessmentListItem, AssessmentReportResponse } from '@/lib/api/types';
import { getPatients } from '@/lib/api/patients';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import SelectDropdown from '@/components/ui/SelectDropdown';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Lightbulb,
  Upload,
  Printer,
  X,
  Activity,
  ClipboardList,
  UserRound,
  CalendarClock,
  ShieldCheck,
  Gauge,
  Layers3,
  CircleDot,
  Percent,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type AssessmentStatus = 'DRAFT' | 'COMPLETED' | 'REVIEWED';
type TableRow = AssessmentListItem & {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  profession: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function nestedRecord(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return isRecord(value) ? value : null;
}

function formatLabel(value: string) {
  const label = value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  if (label.length <= 6 && /^[a-z0-9]+$/i.test(label)) return label.toUpperCase();
  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'REVIEWED': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'DRAFT': return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    default: return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

function getRoleBadgeClass(role?: string | null) {
  switch ((role ?? '').toUpperCase()) {
    case 'ADMIN': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-100';
    case 'SERVICE_PROVIDER': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    default: return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

function ScoreIcon({ scoreKey }: { scoreKey: string }) {
  const normalized = scoreKey.toLowerCase();
  if (normalized.includes('total') || normalized.includes('gmfm')) {
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-100"><Gauge className="h-3.5 w-3.5" /></span>;
  }
  if (normalized.includes('percent')) {
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100"><Percent className="h-3.5 w-3.5" /></span>;
  }
  if (normalized.includes('dimension') || normalized.includes('profile')) {
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100"><Layers3 className="h-3.5 w-3.5" /></span>;
  }
  return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"><CircleDot className="h-3.5 w-3.5" /></span>;
}

function ScoreValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1 text-sm text-slate-600">
        {value.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="min-w-0 break-words">{formatValue(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (isRecord(value)) {
    return (
      <div className={depth === 0 ? 'grid gap-2 md:grid-cols-3' : 'space-y-2'}>
        {Object.entries(value).map(([key, nestedValue]) => {
          const rec = isRecord(nestedValue) ? nestedValue : null;
          const name = typeof (rec as Record<string, unknown> | null)?.['name'] === 'string'
            ? ((rec as Record<string, unknown>)['name'] as string)
            : null;
          const label = name && /^[A-Z]$/.test(key) ? name : formatLabel(key);
          return (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
                {!isRecord(nestedValue) && !Array.isArray(nestedValue) ? (
                  <span className="text-sm font-semibold text-purple-700">{formatValue(nestedValue)}</span>
                ) : null}
              </div>
              {isRecord(nestedValue) || Array.isArray(nestedValue) ? <ScoreValue value={nestedValue} depth={depth + 1} /> : <ScoreMeter value={nestedValue} />}
            </div>
          );
        })}
      </div>
    );
  }
  return <span className="text-sm font-semibold text-purple-700">{formatValue(value)}</span>;
}

function ScoreMeter({ value }: { value: unknown }) {
  const percent = typeof value === 'number' && value >= 0 && value <= 100 ? value : null;
  if (percent === null) return null;
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-purple-500" style={{ width: `${percent}%` }} />
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
            <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">{index + 1}</span>
            <span className="min-w-0 break-words">{formatValue(rec)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">{formatValue(value)}</pre>;
}

function ReportDetailModal({ report, onClose }: { report: AssessmentReportResponse; onClose: () => void }) {
  const reportRecord = report as AssessmentReportResponse & Record<string, unknown>;
  const assessmentRecord = typeof reportRecord.assessment === 'object' && reportRecord.assessment !== null
    ? reportRecord.assessment as Record<string, unknown> : null;
  const patientRecord = nestedRecord(reportRecord, 'patient') || nestedRecord(assessmentRecord, 'patient') || nestedRecord(reportRecord, 'cpPatient') || nestedRecord(assessmentRecord, 'cpPatient');
  const providerRecord = nestedRecord(reportRecord, 'provider') || nestedRecord(assessmentRecord, 'provider') || nestedRecord(reportRecord, 'serviceProvider') || nestedRecord(assessmentRecord, 'serviceProvider');
  const providerUserRecord = nestedRecord(providerRecord, 'user') || nestedRecord(reportRecord, 'assessedBy') || nestedRecord(assessmentRecord, 'assessedBy');
  const toolCode = stringValue(assessmentRecord, 'toolCode') || stringValue(reportRecord, 'toolCode') || 'Assessment Report';
  const status = stringValue(assessmentRecord, 'status') || stringValue(reportRecord, 'status') || 'COMPLETED';
  const assessedAt = stringValue(assessmentRecord, 'assessedAt') || stringValue(reportRecord, 'assessedAt');
  const patientName = stringValue(patientRecord, 'fullName') || stringValue(patientRecord, 'name') || stringValue(assessmentRecord, 'patientName') || stringValue(reportRecord, 'patientName') || 'Patient';
  const patientGender = stringValue(patientRecord, 'gender') || stringValue(assessmentRecord, 'patientGender') || stringValue(reportRecord, 'patientGender');
  const patientDob = stringValue(patientRecord, 'dateOfBirth') || stringValue(patientRecord, 'dob') || stringValue(assessmentRecord, 'patientDob') || stringValue(assessmentRecord, 'dateOfBirth') || stringValue(reportRecord, 'patientDob') || stringValue(reportRecord, 'dateOfBirth');
  const caregiverName = stringValue(patientRecord, 'caregiverName') || stringValue(assessmentRecord, 'caregiverName') || stringValue(reportRecord, 'caregiverName');
  const assessedByName = stringValue(providerUserRecord, 'fullName') || stringValue(providerUserRecord, 'name') || stringValue(providerRecord, 'fullName') || stringValue(providerRecord, 'name') || stringValue(assessmentRecord, 'assessedByName') || stringValue(reportRecord, 'assessedByName') || null;
  const assessedByProfession = stringValue(providerRecord, 'profession');
  const patientAge = patientDob ? (() => { const d = new Date(patientDob); if (Number.isNaN(d.getTime())) return null; const n = new Date(); let a = n.getFullYear() - d.getFullYear(); const m = n.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--; return a; })() : null;
  const patientDetails = [patientAge != null ? `${patientAge} yrs` : null, patientGender ? formatLabel(patientGender) : null].filter(Boolean);
  const scores = report.report.scores ?? {};
  const scoreEntries = Object.entries(scores);
  const headlineScore = scoreEntries.find(([k, v]) => typeof v === 'number' && /total|score|percent/i.test(k));

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="mx-auto flex min-h-[620px] w-full max-w-5xl flex-col rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{toolCode}</h2>
            <p className="mt-1 text-xs text-slate-500">Patient: {patientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700">
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"><X size={14} /></button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700"><FileText className="h-4 w-4" />Clinical Summary</div>
                    <p className="mt-3 text-base leading-7 text-slate-800">{report.report.summary || 'No summary available.'}</p>
                  </div>
                  {headlineScore ? (
                    <div className="shrink-0 text-center">
                      <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 shadow-sm text-[10px] font-semibold uppercase tracking-wide text-purple-700">{formatLabel(headlineScore[0])}</div>
                      <div className="-mt-1 inline-flex rounded-full border border-amber-100 bg-amber-50/90 px-3 py-1 text-sm font-semibold text-amber-800">{formatValue(headlineScore[1])}</div>
                    </div>
                  ) : null}
                </div>
              </div>
              {report.report.interpretation ? (
                <div className="px-5 py-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Activity className="h-4 w-4 text-blue-600" />Interpretation</div>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700">{report.report.interpretation}</p>
                </div>
              ) : null}
            </section>
            {scoreEntries.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BarChart3 className="h-4 w-4 text-purple-600" />Scores</div>
                    <p className="mt-1 text-xs text-slate-500">Domain and computed score breakdown from this assessment.</p>
                  </div>
                </div>
                <ScoreBreakdownInline scores={scores} />
              </section>
            )}
            {Boolean(report.report.recommendations) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Lightbulb className="h-4 w-4 text-amber-500" />Recommendations</div>
                <Recommendations value={report.report.recommendations} />
              </section>
            )}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ClipboardList className="h-4 w-4 text-slate-500" />Assessment Details</div>
              <dl className="mt-4 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-4 text-sm md:grid-cols-3 lg:grid-cols-5">
                <DetailTile icon={UserRound} label="Patient" value={patientName} className="text-blue-700" />
                {patientDetails.length > 0 && <DetailTile icon={UsersRound} label="Patient Details" value={patientDetails.join(' • ')} className="text-purple-700" />}
                <DetailTile icon={ShieldCheck} label="Status" value={status} className="text-emerald-700" />
                <DetailTile icon={CalendarClock} label="Assessed" value={assessedAt ? new Date(assessedAt).toLocaleString() : '—'} className="text-amber-700" />
                {caregiverName && <DetailTile icon={UsersRound} label="Caregiver" value={caregiverName} className="text-rose-700" />}
                {assessedByName && (
                  <DetailTile icon={UserCheck} label="Assessed By" value={assessedByProfession ? `${assessedByName} (${formatLabel(assessedByProfession)})` : assessedByName} className="text-cyan-700" />
                )}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ScoreBreakdownInline({ scores }: { scores: Record<string, unknown> }) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const toggle = (key: string) => setOpenKeys((c) => { const n = new Set(c); n.has(key) ? n.delete(key) : n.add(key); return n; });
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {Object.entries(scores).map(([key, value]) => {
        const hasDetails = isRecord(value) || Array.isArray(value);
        const open = openKeys.has(key);
        return (
          <div key={key} className="rounded-lg border border-slate-200 bg-white">
            <button type="button" onClick={() => hasDetails && toggle(key)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left">
              <span className="flex min-w-0 items-center gap-2"><ScoreIcon scoreKey={key} /><span className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">{formatLabel(key)}</span></span>
              <span className="flex items-center gap-2">
                {!hasDetails && <span className="text-sm font-semibold text-purple-700">{formatValue(value)}</span>}
                {hasDetails && (open ? <ChevronDown className="h-4 w-4 text-purple-600" /> : <ChevronRight className="h-4 w-4 text-purple-600" />)}
              </span>
            </button>
            {!hasDetails && <div className="px-3 pb-3"><ScoreMeter value={value} /></div>}
            {hasDetails && open && (
              <div className="max-h-72 overflow-y-auto border-t border-slate-100 bg-slate-50 p-3"><ScoreValue value={value} depth={1} /></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailTile({ icon: Icon, label, value, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; className: string }) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-current/10"><Icon className="h-3.5 w-3.5" /></span>
      <div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</dt><dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value}</dd></div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminReportsPage() {
  const { user, token } = useAuth();
  const { show } = useToast();
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<AssessmentReportResponse | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const availableTools = useMemo(() => {
    const t = new Set(rows.map((r) => r.toolCode));
    return ['ALL', ...Array.from(t)];
  }, [rows]);

  const [toolFilter, setToolFilter] = useState<string>('ALL');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    try {
      if (!user) throw new Error('No user context');
      const roles = new Set(user.roles.map((r) => r.toLowerCase()));
      const isAdmin = roles.has('admin') || (user.userType ?? '').toUpperCase() === 'ADMIN';

      const patientReports: { patientId: string; patientName: string; assessments: AssessmentListItem[] }[] = [];

      if (isAdmin) {
        const patRes = await fetch('/api/cp-patient', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include', cache: 'no-store' });
        const patJson = await patRes.json().catch(() => null);
        const rawPatients: unknown = (() => {
          if (!isRecord(patJson)) return [];
          const obj = patJson as Record<string, unknown>;
          const inner = obj.data;
          if (isRecord(inner)) {
            const innerObj = inner as Record<string, unknown>;
            if (Array.isArray(innerObj.data)) return innerObj.data;
            return innerObj.data ?? [];
          }
          if (Array.isArray(inner)) return inner;
          return [];
        })();
        const patients: Record<string, unknown>[] = Array.isArray(rawPatients) ? rawPatients.filter(isRecord) : [];

        const concurrency = 6;
        const queue: Record<string, unknown>[] = [...patients];
        const results: typeof patientReports = [];
        const workers: Promise<void>[] = [];
        for (let i = 0; i < Math.min(concurrency, Math.max(queue.length, 1)); i++) {
          workers.push((async () => {
            while (queue.length) {
              const p = queue.shift()! as Record<string, unknown>;
              try {
                const id = stringValue(p, 'id') || stringValue(p, 'patientId') || '';
                if (!id) continue;
                const data = await getPatientAssessments(id);
                if (data.assessments?.length) results.push({ patientId: id, patientName: stringValue(p, 'fullName') || stringValue(p, 'name') || 'Unknown', assessments: data.assessments });
              } catch { /* skip */ }
            }
          })());
        }
        await Promise.all(workers);
        patientReports.push(...results);
      } else {
        const myPatients = await getPatients(token);
        let rawPatients: unknown[] = [];
        if (isRecord(myPatients)) {
          const obj = myPatients as Record<string, unknown>;
          const data = obj.data;
          if (Array.isArray(data)) rawPatients = data as unknown[];
        }
        const patients: Record<string, unknown>[] = rawPatients.filter(isRecord);

        const concurrency = 6;
        const queue: Record<string, unknown>[] = [...patients];
        const results: typeof patientReports = [];
        const workers: Promise<void>[] = [];
        const loops = Math.max(queue.length, 1);
        for (let i = 0; i < Math.min(concurrency, loops); i++) {
          workers.push((async () => {
            while (queue.length) {
              const p = queue.shift()! as Record<string, unknown>;
              try {
                const id = stringValue(p, 'id') || stringValue(p, 'patientId') || '';
                if (!id) continue;
                const data = await getPatientAssessments(id);
                if (data.assessments?.length) results.push({ patientId: id, patientName: stringValue(p, 'fullName') || stringValue(p, 'name') || 'Unknown', assessments: data.assessments });
              } catch { /* skip */ }
            }
          })());
        }
        await Promise.all(workers);
        patientReports.push(...results);
      }

      const mapped: TableRow[] = patientReports.flatMap((pr) =>
        (pr.assessments ?? []).map((a) => {
          const aRec = a as unknown as Record<string, unknown>;
          const providerRec = nestedRecord(aRec, 'provider') || nestedRecord(aRec, 'serviceProvider');
          const providerUserRec = nestedRecord(providerRec, 'user') || nestedRecord(aRec, 'assessedBy');
          return {
            id: stringValue(aRec, 'id') || '',
            toolCode: stringValue(aRec, 'toolCode') || 'UNKNOWN',
            toolVersion: stringValue(aRec, 'toolVersion') || '',
            status: (['DRAFT', 'COMPLETED', 'REVIEWED'].includes(stringValue(aRec, 'status') ?? '') ? stringValue(aRec, 'status') as AssessmentStatus : 'COMPLETED'),
            assessedAt: stringValue(aRec, 'assessedAt') || null,
            patientId: pr.patientId,
            patientName: pr.patientName,
            providerId: stringValue(providerRec, 'id') || stringValue(aRec, 'providerId') || '',
            providerName: stringValue(providerUserRec, 'fullName') || stringValue(providerUserRec, 'name') || stringValue(providerRec, 'fullName') || 'Unknown Provider',
            profession: stringValue(providerRec, 'profession') || '',
          };
        })
      );
      setRows(mapped);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'ALL' && (r.status ?? '') !== statusFilter) return false;
      if (toolFilter !== 'ALL' && (r.toolCode ?? '') !== toolFilter) return false;
      return true;
    });
  }, [rows, statusFilter, toolFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage((p) => Math.min(p, Math.max(1, Math.ceil(filtered.length / pageSize))));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [filtered.length, pageSize]);

  const handleXlsxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const XLSX = (window as unknown as Record<string, unknown>).XLSX as { utils: { sheet_to_json: (d: unknown) => Record<string, unknown>[] }; read: (d: Uint8Array, t: string) => { SheetNames: string[]; Sheets: Record<string, unknown> } } | undefined;
        if (!XLSX) {
          show({ title: 'Error', message: 'xlsx library not available. Please use the Print/PDF export instead.', duration: 3000 });
          return;
        }
        const wb = XLSX.read(data, 'array');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
        const normalized: TableRow[] = json.map((row, idx) => ({
          id: typeof row.id === 'string' ? row.id : `import-${idx}`,
          toolCode: typeof row.toolCode === 'string' ? row.toolCode : typeof row.toolName === 'string' ? row.toolName : 'IMPORTED',
          toolVersion: typeof row.toolVersion === 'string' ? row.toolVersion : typeof row.toolName === 'string' ? row.toolName : '',
          status: ['DRAFT', 'COMPLETED', 'REVIEWED'].includes(String(row.status ?? '')) ? (row.status as AssessmentStatus) : 'COMPLETED',
          assessedAt: typeof row.assessedAt === 'string' ? row.assessedAt : new Date().toISOString(),
          patientId: typeof row.patientId === 'string' ? row.patientId : '',
          patientName: typeof row.patientName === 'string' ? row.patientName : 'Imported',
          providerId: typeof row.providerId === 'string' ? row.providerId : '',
          providerName: typeof row.providerName === 'string' ? row.providerName : 'Unknown',
          profession: typeof row.profession === 'string' ? row.profession : '',
          scores: isRecord(row.scores) ? row.scores : {},
        }));
        setRows((prev) => [...normalized, ...prev]);
        show({ title: 'Uploaded', message: `Imported ${normalized.length} report(s).`, duration: 3000 });
      } catch {
        show({ title: 'Error', message: 'Failed to parse Excel file.', duration: 4000 });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelDownload = () => {
    const header = ['patientName', 'providerName', 'profession', 'toolCode', 'status', 'assessedAt'];
    const body = filtered.map((r) => [r.patientName, r.providerName, r.profession, r.toolCode, r.status, r.assessedAt]);
    const csv = [header, ...body].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[15px] font-semibold text-slate-900">Patient Reports</h1>
              <p className="mt-1 text-xs text-slate-500">View and manage all patient assessment reports.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700">
                <Upload className="h-4 w-4" /> Upload Excel
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleXlsxUpload} />
              </label>
              <button type="button" onClick={handleExcelDownload} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100">
                <Download className="h-4 w-4" /> Download CSV
              </button>
              <SelectDropdown
                value={statusFilter}
                onChange={(v) => setStatusFilter(v || 'ALL')}
                options={[
                  { label: 'All statuses', value: 'ALL' },
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Reviewed', value: 'REVIEWED' },
                ]}
                icon={<ShieldCheck className="h-4 w-4 text-slate-400" />}
              />
              <SelectDropdown
                value={toolFilter}
                onChange={(v) => setToolFilter(v || 'ALL')}
                options={availableTools.map((t) => ({ label: t === 'ALL' ? 'All tools' : formatLabel(t), value: t }))}
                icon={<BarChart3 className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
          ) : fetchError ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-red-200 bg-red-50/30 p-8">
              <div className="text-center">
                <p className="mb-1 text-sm font-medium text-red-600">Could not load reports</p>
                <p className="text-xs text-red-400">{fetchError}</p>
                <button onClick={() => void load()} className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-800">Retry</button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState title="No reports found" description="There are no assessment reports matching the current filters." />
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-2">
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="h-full overflow-auto">
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Provider</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Profession</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Tool</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Assessed</th>
                        <th className="px-4 py-3 text-center text-[11px] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((row, idx) => (
                        <tr key={row.id} className={`transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-emerald-50`}>
                          <td className="border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                {(row.patientName ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{row.patientName}</p>
                                <p className="truncate text-[11px] text-slate-500">{row.patientId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{row.providerName}</td>
                          <td className="border-b border-slate-100 px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeClass(row.profession)}`}>{row.profession || '—'}</span></td>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{row.toolCode}</td>
                          <td className="border-b border-slate-100 px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(row.status)}`}>{row.status ?? '—'}</span></td>
                          <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDate(row.assessedAt)}</td>
                          <td className="border-b border-slate-100 px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={async () => {
                                try {
                                  const full = await getAssessmentReport(row.id);
                                  setSelectedReport(full);
                                 } catch { show({ title: 'Error', message: 'Failed to load report', duration: 3000 }); }
                               }} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100">
                                 <EyeIcon className="h-3.5 w-3.5" /> View
                               </button>
                               <button type="button" onClick={async () => {
                                 try {
                                   await getAssessmentReport(row.id);
                                   window.print();
                                 } catch { show({ title: 'Error', message: 'Failed to load report', duration: 3000 }); }
                              }} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200">
                                <Download className="h-3.5 w-3.5" /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border border-slate-200 bg-white">
                <Pagination page={safePage} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
              </div>
            </div>
          )}
        </div>

        {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      </div>
    </ProtectedRoute>
  );
}

function EyeIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function formatValue(value: unknown) {
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  return JSON.stringify(value, null, 2);
}
