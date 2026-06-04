'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  ActivityIcon,
  HeartPulseIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  GitPullRequestArrowIcon,
  ClipboardCheckIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { getProviderAnalytics } from '@/lib/api/analytics';
import ProviderDashboardSkeleton from '@/components/layout/skeletons/ProviderDashboardSkeleton';

const FALLBACK_IMPROVEMENT_DATA = [
  { name: 'Mon', value: 42 },
  { name: 'Tue', value: 46 },
  { name: 'Wed', value: 51 },
  { name: 'Thu', value: 56 },
  { name: 'Fri', value: 61 },
  { name: 'Sat', value: 64 },
  { name: 'Sun', value: 69 },
];

const FALLBACK_ADHERENCE_DATA = [
  { name: 'Mon', value: 68 },
  { name: 'Tue', value: 70 },
  { name: 'Wed', value: 73 },
  { name: 'Thu', value: 76 },
  { name: 'Fri', value: 78 },
  { name: 'Sat', value: 81 },
  { name: 'Sun', value: 84 },
];

const FALLBACK_TASK_DATA = [
  { name: 'Mon', assigned: 8 },
  { name: 'Tue', assigned: 10 },
  { name: 'Wed', assigned: 9 },
  { name: 'Thu', assigned: 11 },
  { name: 'Fri', assigned: 7 },
  { name: 'Sat', assigned: 5 },
  { name: 'Sun', assigned: 4 },
];

const FALLBACK_RECOVERY_DATA = [
  { label: 'Improving Patients', value: '18', note: 'Responding well to therapy', color: 'emerald' },
  { label: 'Stable Cases', value: '7', note: 'Routine monitoring ongoing', color: 'blue' },
  { label: 'Needs Review', value: '3', note: 'Closer clinical attention', color: 'amber' },
];

type CompactStatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  meta?: string;
  footer?: React.ReactNode;
  badge?: string;
};

function CompactStatCard({
  title,
  value,
  icon,
  meta,
  footer,
  badge,
}: CompactStatCardProps) {
  return (
    <div className="group relative h-[118px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:border-slate-300">
      <div className="absolute inset-0 bg-slate-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold leading-none text-slate-600">
            {title}
          </p>

          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="rounded-full border-none bg-slate-50 px-1.5 py-0.5 text-[8px] font-medium uppercase leading-none text-slate-500">
                {badge}
              </span>
            )}
            <div className="text-slate-400">{icon}</div>
          </div>
        </div>

        <div>
          <h3 className="text-[24px] font-bold leading-none tracking-tight text-slate-900">
            {value}
          </h3>

          {meta ? (
            <p className="mt-2 line-clamp-1 text-[10px] leading-none text-slate-400">
              {meta}
            </p>
          ) : (
            <div className="mt-3 min-h-[24px] text-[9px] font-medium leading-none">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4', className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function formatMetric(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
}

type ProviderMetricsCard = {
  sessionsCompleted?: number | string;
  averageRating?: number | string;
  totalReferrals?: number | string;
  pendingReferrals?: number | string;
  approvedReferrals?: number | string;
  declinedReferrals?: number | string;
  totalTasks?: number | string;
  completedTasks?: number | string;
  openTasks?: number | string;
  adherenceRate?: number | string;
  adherenceAtRisk?: number | string;
  pendingApprovals?: number | string;
  approvedApprovals?: number | string;
  rejectedApprovals?: number | string;
  improvementTrend?: Array<{ name: string; value: number }>;
  adherenceTrend?: Array<{ name: string; value: number }>;
  dailyTasks?: Array<{ name: string; assigned: number }>;
  patientRecovery?: Array<{
    label: string;
    value: string;
    note: string;
    color: string;
  }>;
};

export function ProviderDashboard() {
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [metrics, setMetrics] = useState<ProviderMetricsCard | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (filter?: string) => {
    setMetricsError(null);
    setIsLoadingMetrics(true);

    try {
      const data = await getProviderAnalytics(filter);

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid analytics response format');
      }

      const referrals = data.kpis.referrals;
      const assignedTasks = data.kpis.assignedTasks;
      const adherence = data.kpis.carePlanAdherence;
      const totalReferrals = referrals.pending + referrals.approved + referrals.declined;
      const totalTasks = assignedTasks.open + assignedTasks.done;
      const recovery = data.charts.patientRecovery;

      setMetrics({
        sessionsCompleted: data.kpis.sessionsCompleted.count,
        averageRating: data.kpis.sessionsCompleted.averageRating,
        totalReferrals,
        pendingReferrals: referrals.pending,
        approvedReferrals: referrals.approved,
        declinedReferrals: referrals.declined,
        totalTasks,
        completedTasks: assignedTasks.done,
        openTasks: assignedTasks.open,
        adherenceRate: adherence.onTrackPercentage,
        adherenceAtRisk: adherence.atRiskPercentage,
        pendingApprovals: data.kpis.approvals.pending,
        approvedApprovals: data.kpis.approvals.approved,
        rejectedApprovals: data.kpis.approvals.rejected,
        improvementTrend: data.charts.patientProgress?.map((point) => ({
          name: point.day,
          value: point.value,
        })),
        adherenceTrend: data.charts.adherenceTrend?.map((point) => ({
          name: point.day,
          value: point.value,
        })),
        dailyTasks: data.charts.assignedDailyTasks?.map((point) => ({
          name: point.day,
          assigned: point.value,
        })),
        patientRecovery: [
          { label: 'Improving Patients', value: String(recovery.improved), note: 'Responding well to therapy', color: 'emerald' },
          { label: 'Stable Cases', value: String(recovery.stable), note: 'Routine monitoring ongoing', color: 'blue' },
          { label: 'Needs Review', value: String(recovery.regressed), note: 'Closer clinical attention', color: 'amber' },
        ],
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load provider analytics';
      console.error('Failed to load provider dashboard analytics:', errorMessage, error);
      setMetricsError(errorMessage);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  const handleRefresh = useCallback(async (filter: string) => {
    setActiveFilter(filter);
    if (filter === activeFilter) {
      await loadMetrics(filter);
    }
  }, [activeFilter, loadMetrics]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMetrics(activeFilter);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadMetrics, activeFilter]);

  const improvementTrendData = metrics?.improvementTrend ?? FALLBACK_IMPROVEMENT_DATA;
  const adherenceTrendData = metrics?.adherenceTrend ?? FALLBACK_ADHERENCE_DATA;
  const dailyTasksData = metrics?.dailyTasks ?? FALLBACK_TASK_DATA;
  const patientRecoveryData = metrics?.patientRecovery ?? FALLBACK_RECOVERY_DATA;

  if (isLoadingMetrics && !metrics) {
    return <ProviderDashboardSkeleton />;
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Clinical progress, referrals, adherence
          </p>
          {metricsError ? (
            <p className="mt-2 text-xs text-rose-600">{metricsError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleRefresh(filter)}
              disabled={isLoadingMetrics}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] font-medium transition-all',
                activeFilter === filter
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                isLoadingMetrics && 'pointer-events-none opacity-50'
              )}
            >
              <RefreshCwIcon
                size={10}
                className={cn(
                  'shrink-0',
                  isLoadingMetrics && activeFilter === filter && 'animate-spin'
                )}
              />
              <span>{isLoadingMetrics && activeFilter === filter ? 'Refreshing...' : filter}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CompactStatCard
          title="Completed Sessions"
          value={formatMetric(metrics?.sessionsCompleted)}
          icon={<CheckCircleIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                Rating {metrics?.averageRating !== undefined ? formatMetric(metrics.averageRating) : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Referrals"
          value={formatMetric(metrics?.totalReferrals)}
          icon={<GitPullRequestArrowIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                Pending {metrics?.pendingReferrals !== undefined ? formatMetric(metrics.pendingReferrals) : '—'}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Approved {metrics?.approvedReferrals !== undefined ? formatMetric(metrics.approvedReferrals) : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Care Plan Adherence"
          value={metrics?.adherenceRate !== undefined ? `${metrics.adherenceRate}%` : '—'}
          icon={<HeartPulseIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-green-50 px-2 py-1 text-green-600">
                On Track {metrics?.adherenceRate !== undefined ? `${metrics.adherenceRate}%` : '—'}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">
                At Risk {metrics?.adherenceAtRisk !== undefined ? `${metrics.adherenceAtRisk}%` : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Assigned Tasks"
          value={formatMetric(metrics?.totalTasks)}
          icon={<ActivityIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Done {metrics?.completedTasks !== undefined ? formatMetric(metrics.completedTasks) : '—'}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                Open {metrics?.openTasks !== undefined ? formatMetric(metrics.openTasks) : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Approvals"
          value={formatMetric(metrics?.pendingApprovals)}
          icon={<ClipboardCheckIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Approved {metrics?.approvedApprovals !== undefined ? formatMetric(metrics.approvedApprovals) : '—'}
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">
                Rejected {metrics?.rejectedApprovals !== undefined ? formatMetric(metrics.rejectedApprovals) : '—'}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SectionCard
          title="Patient Progress"
          subtitle="Aggregate neurological improvement across active patients"
        >
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={improvementTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 8px 14px -3px rgb(0 0 0 / 0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#64748b"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#64748b' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Adherence Trend"
          subtitle="Exercise and session completion rate across active care plans"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={adherenceTrendData}>
              <defs>
                <linearGradient id="providerAdherenceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 14px -3px rgb(0 0 0 / 0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#94a3b8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#providerAdherenceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Assigned Daily Tasks"
          subtitle="Scheduled provider tasks and follow-ups across the week"
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dailyTasksData} barCategoryGap={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 14px -3px rgb(0 0 0 / 0.08)',
                }}
              />
              <Bar dataKey="assigned" radius={[4, 4, 0, 0]} fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Patient Recovery
              </h3>
              <p className="mt-1 text-[10px] text-slate-400">
                Snapshot of recovery outcomes across your active patient cohort
              </p>
            </div>
            <div className="rounded-md bg-emerald-50 p-1.5 text-emerald-600">
              <TrendingUpIcon size={12} />
            </div>
          </div>

          <div className="space-y-2.5">
            {patientRecoveryData.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">{item.note}</p>
                  </div>
                  <div
                    className={cn(
                      'text-[13px] font-bold',
                      item.color === 'emerald' && 'text-emerald-600',
                      item.color === 'blue' && 'text-blue-600',
                      item.color === 'amber' && 'text-amber-600'
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Recovery outlook</span>
              <span className="font-semibold text-emerald-600">Stable improvement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
