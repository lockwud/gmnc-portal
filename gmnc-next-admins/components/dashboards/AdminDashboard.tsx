'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  UsersIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UserCheckIcon,
  HeartPulseIcon,
  RefreshCwIcon,
  TrendingUpIcon,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell as PieCell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';
import { getAdminAnalytics } from '@/lib/api/analytics';
import AdminDashboardSkeleton from '@/components/layout/skeletons/AdminDashboardSkeleton';

type SystemMetricsCard = {
  totalUsers?: number | string;
  verifiedProviders?: number | string;
  openSupportTickets?: number | string;
  carePlanAdherence?: number | string;
  pendingApprovals?: number | string;
  providerVerification?: {
    verified?: number;
    pending?: number;
    flagged?: number;
  };
  improvementTrend?: Array<{ name: string; improvement: number }>;
  dailyTasks?: Array<{ name: string; assigned: number }>;
  patientRecovery?: Array<{
    label: string;
    value: string;
    note: string;
    color: string;
  }>;
  activePercentage?: number | string;
  newUsers?: number | string;
  criticalTickets?: number | string;
  slaStatus?: string;
  adherenceOnTrack?: number | string;
  adherenceAtRisk?: number | string;
  totalTasks?: number | string;
};

function formatMetric(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
}

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

export function AdminDashboard() {
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [metrics, setMetrics] = useState<SystemMetricsCard | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (filter?: string) => {
    setMetricsError(null);
    setIsLoadingMetrics(true);

    try {
      const data = await getAdminAnalytics(filter);

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid analytics response format');
      }

      const verificationCounts = data.kpis.verifiedProviders;
      const supportTickets = data.kpis.openSupportTickets;
      const adherence = data.kpis.carePlanAdherence;
      const assignedDailyTasks = data.charts.assignedDailyTasks ?? [];

      setMetrics({
        totalUsers: data.kpis.totalUsers.count,
        verifiedProviders: verificationCounts.count,
        openSupportTickets: supportTickets.count,
        carePlanAdherence: adherence.onTrackPercentage,
        pendingApprovals: data.kpis.pendingApprovals.queueCount,
        providerVerification: {
          verified: verificationCounts.count,
          pending: verificationCounts.pendingCount,
          flagged: verificationCounts.flaggedCount,
        },
        improvementTrend: data.charts.cpImprovementTrend?.map((point) => ({
          name: point.day,
          improvement: point.value,
        })),
        dailyTasks: assignedDailyTasks.map((point) => ({
          name: point.day,
          assigned: point.value,
        })),
        activePercentage: data.kpis.totalUsers.activePercentage,
        newUsers: data.kpis.totalUsers.newCount,
        criticalTickets: supportTickets.criticalCount,
        slaStatus: supportTickets.slaStatus,
        adherenceOnTrack: adherence.onTrackPercentage,
        adherenceAtRisk: adherence.atRiskPercentage,
        totalTasks: assignedDailyTasks.reduce((sum, point) => sum + Number(point.value || 0), 0),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load admin analytics';
      console.error('Failed to load admin dashboard analytics:', errorMessage, error);
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

  const providerVerificationData = metrics?.providerVerification
    ? [
        { name: 'Verified', value: metrics.providerVerification.verified ?? 0, color: '#059669' },
        { name: 'Pending', value: metrics.providerVerification.pending ?? 0, color: '#f59e0b' },
        { name: 'Flagged', value: metrics.providerVerification.flagged ?? 0, color: '#ef4444' },
      ]
    : [];

  const improvementTrendData = metrics?.improvementTrend ?? [];
  const dailyTasksData = metrics?.dailyTasks ?? [];

  const patientRecoveryData = metrics?.patientRecovery ?? [];

  if (isLoadingMetrics && !metrics) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
            Platform operations
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
          title="Total Users"
          value={formatMetric(metrics?.totalUsers)}
          icon={<UsersIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Active {metrics?.activePercentage !== undefined ? `${metrics.activePercentage}%` : '—'}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                New {metrics?.newUsers !== undefined ? formatMetric(metrics.newUsers) : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Verified Providers"
          value={formatMetric(metrics?.verifiedProviders)}
          icon={<UserCheckIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">
                Pending {metrics?.providerVerification?.pending !== undefined ? formatMetric(metrics.providerVerification.pending) : '—'}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Flagged {metrics?.providerVerification?.flagged !== undefined ? metrics.providerVerification.flagged : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Open Support Tickets"
          value={formatMetric(metrics?.openSupportTickets)}
          icon={<AlertTriangleIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Critical {metrics?.criticalTickets !== undefined ? formatMetric(metrics.criticalTickets) : '—'}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                {metrics?.slaStatus !== undefined ? String(metrics.slaStatus) : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Care Plan Adherence"
          value={metrics?.carePlanAdherence !== undefined ? `${metrics.carePlanAdherence}%` : '—'}
          icon={<HeartPulseIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                Tasks {metrics?.totalTasks !== undefined ? formatMetric(metrics.totalTasks) : '—'}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">
                At Risk {metrics?.adherenceAtRisk !== undefined ? `${metrics.adherenceAtRisk}%` : '—'}
              </span>
            </div>
          }
        />

        <CompactStatCard
          title="Pending Approvals"
          value={formatMetric(metrics?.pendingApprovals)}
          icon={<ActivityIcon size={14} />}
          badge="Queue"
          meta="Users, providers and escalations"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Provider Verification
            </h3>
            <p className="mt-1 text-[10px] text-slate-400">
              Verification and review distribution
            </p>
          </div>

          <div className="flex h-full items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={providerVerificationData}
                  cx="50%"
                  cy="48%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {providerVerificationData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              CP Improvement Trend
            </h3>
            <p className="mt-1 text-[10px] text-slate-400">
              Trend of improvement across active cerebral palsy care plans
            </p>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={improvementTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="improvement"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 3, fill: '#059669' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Assigned Daily Tasks
            </h3>
            <p className="mt-1 text-[10px] text-slate-400">
              Daily assigned care and operational tasks across the platform
            </p>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyTasksData} barCategoryGap={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="assigned" radius={[4, 4, 0, 0]} fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Patient Recovery
              </h3>
              <p className="mt-1 text-[10px] text-slate-400">
                Snapshot of recovery outcomes across active patient cohorts
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
                    <p className="text-[11px] font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {item.note}
                    </p>
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
            {patientRecoveryData.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                No recovery data returned by the API.
              </p>
            ) : null}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Recovery trend</span>
              <span className="font-semibold text-emerald-600">Improving overall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
