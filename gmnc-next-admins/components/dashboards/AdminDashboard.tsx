'use client';

import React, { useState } from 'react';
import {
  UsersIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UserCheckIcon,
  HeartPulseIcon,
  RefreshCwIcon,
  TrendingUpIcon,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
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

const PIE_DATA = [
  { name: 'Verified', value: 756, color: '#059669' },
  { name: 'Pending', value: 82, color: '#f59e0b' },
  { name: 'Flagged', value: 24, color: '#ef4444' },
];

const IMPROVEMENT_TREND_DATA = [
  { name: 'Mon', improvement: 42 },
  { name: 'Tue', improvement: 48 },
  { name: 'Wed', improvement: 51 },
  { name: 'Thu', improvement: 57 },
  { name: 'Fri', improvement: 63 },
  { name: 'Sat', improvement: 68 },
  { name: 'Sun', improvement: 72 },
];

const DAILY_TASKS_DATA = [
  { name: 'Mon', assigned: 18 },
  { name: 'Tue', assigned: 22 },
  { name: 'Wed', assigned: 20 },
  { name: 'Thu', assigned: 26 },
  { name: 'Fri', assigned: 24 },
  { name: 'Sat', assigned: 16 },
  { name: 'Sun', assigned: 14 },
];

const PATIENT_RECOVERY_DATA = [
  { label: 'Improving', value: '68%', note: 'Steady therapy response', color: 'emerald' },
  { label: 'Stable', value: '21%', note: 'Monitoring continues', color: 'blue' },
  { label: 'Needs attention', value: '11%', note: 'Closer intervention required', color: 'amber' },
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

export function AdminDashboard() {
  const [activeFilter, setActiveFilter] = useState('This Week');

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
          title="Total Users"
          value="2,450"
          icon={<UsersIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Active 98%</span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">New +124</span>
            </div>
          }
        />

        <CompactStatCard
          title="Verified Providers"
          value="862"
          icon={<UserCheckIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">Pending 82</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Flagged 24</span>
            </div>
          }
        />

        <CompactStatCard
          title="Open Support Tickets"
          value="12"
          icon={<AlertTriangleIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Critical 3</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">SLA On Track</span>
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
          title="Pending Approvals"
          value="34"
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
                  data={PIE_DATA}
                  cx="50%"
                  cy="48%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
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
            <LineChart data={IMPROVEMENT_TREND_DATA}>
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
            <BarChart data={DAILY_TASKS_DATA} barCategoryGap={18}>
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
            {PATIENT_RECOVERY_DATA.map((item) => (
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