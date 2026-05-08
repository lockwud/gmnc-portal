'use client';

import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import {
  CheckCircleIcon,
  ActivityIcon,
  HeartPulseIcon,
  Clock3Icon,
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

const IMPROVEMENT_DATA = [
  { name: 'Mon', value: 42 },
  { name: 'Tue', value: 46 },
  { name: 'Wed', value: 51 },
  { name: 'Thu', value: 56 },
  { name: 'Fri', value: 61 },
  { name: 'Sat', value: 64 },
  { name: 'Sun', value: 69 },
];

const ADHERENCE_DATA = [
  { name: 'Mon', value: 68 },
  { name: 'Tue', value: 70 },
  { name: 'Wed', value: 73 },
  { name: 'Thu', value: 76 },
  { name: 'Fri', value: 78 },
  { name: 'Sat', value: 81 },
  { name: 'Sun', value: 84 },
];

const TASK_DATA = [
  { name: 'Mon', assigned: 8 },
  { name: 'Tue', assigned: 10 },
  { name: 'Wed', assigned: 9 },
  { name: 'Thu', assigned: 11 },
  { name: 'Fri', assigned: 7 },
  { name: 'Sat', assigned: 5 },
  { name: 'Sun', assigned: 4 },
];

const PROVIDER_RECOVERY_DATA = [
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

export function ProviderDashboard() {
  const [activeFilter, setActiveFilter] = useState('This Week');

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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] font-medium transition-all',
                activeFilter === filter
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <RefreshCwIcon size={10} className="shrink-0" />
              <span>{filter}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CompactStatCard
          title="Sessions Completed"
          value="124"
          icon={<CheckCircleIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">This Week +12</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Rating 4.9/5</span>
            </div>
          }
        />

        <CompactStatCard
          title="Referrals"
          value="28"
          icon={<GitPullRequestArrowIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">Pending 9</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Approved 16</span>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">Declined 3</span>
            </div>
          }
        />

        <CompactStatCard
          title="Care Plan Adherence"
          value="84%"
          icon={<HeartPulseIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">On Track 68%</span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">At Risk 16%</span>
            </div>
          }
        />

        <CompactStatCard
          title="Assigned Tasks"
          value="11"
          icon={<ActivityIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Done 7</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Open 4</span>
            </div>
          }
        />

        <CompactStatCard
          title="Approvals"
          value="19"
          icon={<ClipboardCheckIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">Pending 5</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Approved 12</span>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">Rejected 2</span>
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
              <LineChart data={IMPROVEMENT_DATA}>
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
            <AreaChart data={ADHERENCE_DATA}>
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
            <BarChart data={TASK_DATA} barCategoryGap={18}>
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
            {PROVIDER_RECOVERY_DATA.map((item) => (
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
