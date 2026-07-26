'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { getCarePlan, listCarePlans, generateCarePlan, updateCarePlanStatus, type CarePlan } from '@/lib/api/care-plans';
import type { CarePlanStatus } from '@/lib/api/care-plans';

function getStatusClass(status?: CarePlanStatus | string | null) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'SUPERSEDED':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function emptyState(
  title: string,
  description: string,
  actionLabel: string,
  onAction: () => void,
) {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function ProviderCarePlansPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const accessToken = token || null;
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [detailPlan, setDetailPlan] = useState<CarePlan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<CarePlanStatus | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCarePlans(undefined, token);
      setPlans(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load care plans.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadPlans(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadPlans]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  useEffect(() => {
    if (!selectedPlan) {
      const timeout = window.setTimeout(() => setDetailPlan(null), 0);
      return () => window.clearTimeout(timeout);
    }

    const planId = selectedPlan.patientId;
    const plan = selectedPlan;
    let active = true;
    async function loadDetail() {
      try {
        setDetailLoading(true);
        const data = await getCarePlan(planId, token);
        if (!active) return;
        setDetailPlan(data ?? null);
      } catch {
        if (!active) return;
        setDetailPlan(selectedPlan);
      } finally {
        if (active) setDetailLoading(false);
      }
    }

    void loadDetail();
    return () => {
      active = false;
    };
  }, [selectedPlan, selectedPlan?.patientId, token]);

  const handleGenerate = async (assessmentId: string) => {
    try {
      setError(null);
      const created = await generateCarePlan(assessmentId, token);
      setPlans((current) => [created, ...current]);
      setSelectedPlanId(created.id);
      setDetailPlan(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate care plan.');
    }
  };

  const handleStatusChange = async (planId: string, status: CarePlanStatus) => {
    try {
      setSavingStatus(status);
      const updated = await updateCarePlanStatus(planId, status, token);
      setPlans((current) => current.map((p) => (p.id === planId ? updated : p)));
      setDetailPlan(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update care plan status.');
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <div className="flex h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-white">
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h1 className="text-[15px] font-semibold text-slate-900">Care Plans</h1>
            <p className="mt-1 text-xs text-slate-500">Manage generated care plans for your patients.</p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading care plans...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : plans.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No care plans yet. Generate one from an approved assessment report.
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => {
                  const selected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selected
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {plan.patient?.fullName ?? 'Patient'}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {plan.provider?.user?.fullName ?? 'Provider'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(
                            plan.status,
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">Assessed: {formatDate(plan.createdAt)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={() => router.push('/provider/assessments')}
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to assessments
            </button>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <h2 className="text-[15px] font-semibold text-slate-900">Care plan detail</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedPlan ? selectedPlan.patient?.fullName : 'Select a care plan from the list.'}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-6">
            {!selectedPlan ? (
              emptyState('No selection', 'Choose a care plan from the left panel to view or update it.', 'Go to assessments', () => router.push('/provider/assessments'))
            ) : detailLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading care plan...
              </div>
            ) : detailPlan ? (
              <div className="mx-auto max-w-3xl space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Care Plan</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Patient: {detailPlan.patient?.fullName ?? '—'} • Assessment:{' '}
                        {detailPlan.assessmentId?.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(detailPlan.status)}`}>
                      {detailPlan.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600">Status</label>
                    <select
                      value={savingStatus ?? detailPlan.status ?? 'ACTIVE'}
                      onChange={(e) => handleStatusChange(detailPlan.id, e.target.value as CarePlanStatus)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="SUPERSEDED">SUPERSEDED</option>
                    </select>
                  </div>
                  {detailPlan.reviewDate && (
                    <p className="mt-2 text-xs text-slate-500">
                      Review date:{' '}
                      {formatDate(detailPlan.reviewDate)}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Goals</h3>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-6 text-slate-700">
                      {JSON.stringify(detailPlan.goals ?? [], null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Interventions</h3>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-6 text-slate-700">
                      {JSON.stringify(detailPlan.interventions ?? [], null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-900">Metadata</h3>
                  <dl className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient ID</dt>
                      <dd className="mt-1 break-all">{detailPlan.patientId}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Assessment ID</dt>
                      <dd className="mt-1 break-all">{detailPlan.assessmentId}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created</dt>
                      <dd className="mt-1">{new Date(detailPlan.createdAt).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Primary Provider</dt>
                      <dd className="mt-1">
                        {detailPlan.provider?.user?.fullName ?? detailPlan.primaryProviderId}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Care plan not found.
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
