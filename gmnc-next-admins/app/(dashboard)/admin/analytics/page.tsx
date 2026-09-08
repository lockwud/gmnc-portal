'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';
import { getAdminAnalytics, type AdminDashboardAnalytics, type AnalyticsFilter } from '@/lib/api/analytics';

const FILTERS: Array<{ value: AnalyticsFilter; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'all_time', label: 'All time' },
];

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p> : null}
    </div>
  );
}

function TrendBars({ title, points }: { title: string; points: Array<{ day: string; value: number }> }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black text-slate-900">{title}</h2>
      {points.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No data for this period.</p>
      ) : (
        <div className="mt-4 flex items-end gap-2" style={{ height: 140 }}>
          {points.map((point, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-emerald-500/80"
                style={{ height: `${Math.max(4, Math.round((point.value / max) * 110))}px` }}
                title={`${point.day}: ${point.value}`}
              />
              <span className="text-[9px] font-medium text-slate-400">{point.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsRoute() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <AnalyticsPage />
    </ProtectedRoute>
  );
}

function AnalyticsPage() {
  const [filter, setFilter] = useState<AnalyticsFilter>('this_week');
  const [data, setData] = useState<AdminDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await getAdminAnalytics(filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-950">Platform Analytics</h1>
          <p className="mt-1 text-xs text-slate-500">Live platform KPIs and activity trends from the backend.</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${filter === option.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error || !data ? (
        <EmptyState
          title="Analytics unavailable"
          description={error ?? 'No analytics data returned.'}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total users"
              value={String(data.kpis.totalUsers.count)}
              sub={`${data.kpis.totalUsers.activePercentage}% active · ${data.kpis.totalUsers.newCount} new`}
            />
            <KpiCard
              label="Verified providers"
              value={String(data.kpis.verifiedProviders.count)}
              sub={`${data.kpis.verifiedProviders.pendingCount} pending · ${data.kpis.verifiedProviders.flaggedCount} flagged`}
            />
            <KpiCard
              label="Open support tickets"
              value={String(data.kpis.openSupportTickets.count)}
              sub={`${data.kpis.openSupportTickets.criticalCount} critical · SLA ${data.kpis.openSupportTickets.slaStatus}`}
            />
            <KpiCard
              label="Approval queue"
              value={String(data.kpis.pendingApprovals.queueCount)}
              sub={`Adherence on track ${data.kpis.carePlanAdherence.onTrackPercentage}%`}
            />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black text-slate-900">Provider verification</h2>
              <ul className="mt-3 space-y-2">
                {data.charts.providerVerification.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                    <span className="font-bold text-slate-700">{entry.status}</span>
                    <span className="font-black text-slate-900">{entry.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <TrendBars title="Tasks completed per day" points={data.charts.cpImprovementTrend} />
          </div>
          <div className="mt-4">
            <TrendBars title="Tasks assigned per day" points={data.charts.assignedDailyTasks} />
          </div>
        </>
      )}
    </div>
  );
}
