'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';

// Representative permissions spanning the clinical and admin surface.
// Each is evaluated live against the backend (/rbac/check) for the session.
const CHECKS = [
  { code: 'patient.list', label: 'List patients' },
  { code: 'patient.read', label: 'Read patient' },
  { code: 'appointment.read', label: 'Read appointments' },
  { code: 'report.list', label: 'List reports' },
  { code: 'support.list', label: 'List support tickets' },
  { code: 'metrics.system', label: 'System metrics' },
  { code: 'rbac.manage', label: 'Manage RBAC' },
  { code: 'assessment.tool.manage', label: 'Manage assessment tools' },
];

type CheckResult = { code: string; label: string; allowed: boolean | null; error?: string };

/**
 * Tester workspace. TESTER is a backend RBAC role that bypasses several
 * clinical gates (assessments, referrals) so flows can be exercised without a
 * verified provider profile. This page verifies the session end to end:
 * identity, live permission checks, and backend reachability — no mock data.
 */
export default function TesterRoute() {
  return (
    <ProtectedRoute>
      <TesterPage />
    </ProtectedRoute>
  );
}

function TesterPage() {
  const { user, token } = useAuth();
  const [checks, setChecks] = useState<CheckResult[]>(CHECKS.map((c) => ({ ...c, allowed: null })));
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  const runChecks = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      CHECKS.map(async (check) => {
        try {
          const res = await fetch(`/api/rbac/check?permission=${encodeURIComponent(check.code)}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            credentials: 'include',
            cache: 'no-store',
          });
          if (!res.ok) {
            return { ...check, allowed: false as const, error: `HTTP ${res.status}` };
          }
          const data = await res.json().catch(() => null);
          const allowed = Boolean(
            (data as { data?: { allowed?: boolean; hasPermission?: boolean } })?.data?.allowed ??
            (data as { allowed?: boolean; hasPermission?: boolean })?.allowed ??
            (data as { data?: { hasPermission?: boolean } })?.data?.hasPermission ??
            false,
          );
          return { ...check, allowed };
        } catch (error) {
          return { ...check, allowed: false as const, error: error instanceof Error ? error.message : 'check failed' };
        }
      }),
    );
    setChecks(results);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void runChecks();
      fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
        .then((res) => setBackendOk(res.ok))
        .catch(() => setBackendOk(false));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [runChecks]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5">
        <h1 className="text-lg font-black text-slate-950">Tester Workspace</h1>
        <p className="mt-1 text-xs text-slate-500">
          Live session verification for QA: identity, backend-issued permissions, and reachability.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Session</h2>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">User</dt>
              <dd className="font-bold text-slate-800">{user?.name ?? user?.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Type</dt>
              <dd className="font-bold text-slate-800">{user?.userType ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Roles</dt>
              <dd className="text-right font-bold text-slate-800">{(user?.roles ?? []).join(', ') || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Backend</dt>
              <dd className={`font-bold ${backendOk === false ? 'text-rose-600' : 'text-emerald-600'}`}>
                {backendOk === null ? 'Checking…' : backendOk ? 'Reachable' : 'Unreachable'}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => void runChecks()}
            className="mt-4 h-9 w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Re-run checks
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Live permission checks</h2>
          <p className="mt-1 text-xs text-slate-500">Evaluated against the backend for this session right now.</p>
          {loading ? (
            <p className="mt-3 text-xs text-slate-500">Running checks…</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {checks.map((check) => (
                <li key={check.code} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{check.label}</p>
                    <p className="font-mono text-[10px] text-slate-400">{check.code}</p>
                  </div>
                  {check.allowed === null ? (
                    <span className="font-bold text-slate-400">…</span>
                  ) : check.allowed ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-700">Allowed</span>
                  ) : (
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 font-bold text-rose-700" title={check.error ?? 'Denied'}>
                      Denied
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
