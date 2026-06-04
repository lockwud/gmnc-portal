'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import {
  InboxIcon,
  Clock3Icon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  HeadsetIcon,
  ShieldAlertIcon,
  ActivityIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupportAnalytics, type SupportDashboardAnalytics, type SupportTicketMeta } from '@/lib/api/analytics';

type SupportBoardItem = {
  id: string;
  time: string;
  tag: string;
  title: string;
  subtitle: string;
  assignees: string[];
  more: string;
  ref: string;
  priority: string;
};

type SupportBoardColumn = {
  title: string;
  count: number;
  items: SupportBoardItem[];
};

function buildSupportBoard(data: SupportDashboardAnalytics | null): SupportBoardColumn[] {
  if (!data) {
    return [];
  }

  return [
    {
      title: 'New Requests',
      count: data.kpis.openQueue.new,
      items: data.queues.newRequests.map(mapTicket),
    },
    {
      title: 'In Progress',
      count: data.kpis.openQueue.inProgress,
      items: data.queues.inProgress.map(mapTicket),
    },
    {
      title: 'Escalated',
      count: data.kpis.criticalEscalations.count,
      items: data.queues.escalated.map(mapTicket),
    },
  ];
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
              <Badge className="border-none bg-slate-50 px-1.5 py-0.5 text-[8px] font-medium uppercase leading-none text-slate-500">
                {badge}
              </Badge>
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

function AvatarPill({ text, color }: { text: string; color: string }) {
  return (
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold',
        color === 'red' && 'border-rose-200 bg-rose-50 text-rose-500',
        color === 'blue' && 'border-blue-200 bg-blue-50 text-blue-500',
        color === 'green' && 'border-emerald-200 bg-emerald-50 text-emerald-500',
        color === 'amber' && 'border-amber-200 bg-amber-50 text-amber-500',
        color === 'slate' && 'border-slate-200 bg-slate-50 text-slate-500'
      )}
    >
      {text}
    </div>
  );
}

function SupportCard({
  item,
}: {
  item: SupportBoardItem;
}) {
  const priorityClass =
    item.priority === 'Critical'
      ? 'bg-rose-50 text-rose-600'
      : item.priority === 'High'
        ? 'bg-amber-50 text-amber-600'
        : item.priority === 'Medium'
          ? 'bg-blue-50 text-blue-600'
          : 'bg-slate-100 text-slate-600';

  const colors = ['red', 'blue', 'green', 'amber', 'slate'] as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] text-slate-400">{item.time}</p>

      <div className="mt-2 inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
        {item.tag}
      </div>

      <div className="mt-2">
        <p className="text-[11px] font-semibold text-slate-700">
          {item.title}
        </p>
        <p className="mt-1 text-[12px] font-bold text-slate-900">
          {item.subtitle}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center -space-x-1">
          {item.assignees.map((assignee, index) => (
            <AvatarPill
              key={assignee}
              text={assignee}
              color={colors[index % colors.length]}
            />
          ))}
          <div className="flex h-6 items-center rounded-full border border-slate-200 bg-amber-50 px-1.5 text-[9px] font-bold text-slate-600">
            {item.more}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold uppercase', priorityClass)}>
            {item.priority}
          </span>
          <span className="text-[9px] text-slate-500">{item.ref}</span>
        </div>
      </div>
    </div>
  );
}

function formatNumber(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
}

function formatTicketTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'NA';
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function mapTicket(ticket: SupportTicketMeta): SupportBoardItem {
  const assignees = ticket.usersInvolved.length > 0
    ? ticket.usersInvolved.map(getInitials)
    : ['NA'];

  return {
    id: ticket.ticketId,
    time: formatTicketTime(ticket.time),
    tag: ticket.issueType || 'SUPPORT',
    title: ticket.description || 'Support request',
    subtitle: ticket.issueType || 'Queue item',
    assignees: assignees.slice(0, 3),
    more: assignees.length > 3 ? `+${assignees.length - 3}` : '+0',
    ref: ticket.ticketId,
    priority: ticket.priority || 'Medium',
  };
}

export function SupportDashboard() {
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [analytics, setAnalytics] = useState<SupportDashboardAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (filter?: string) => {
    setAnalyticsError(null);
    setIsLoadingAnalytics(true);

    try {
      const data = await getSupportAnalytics(filter);
      setAnalytics(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load support analytics';
      console.error('Failed to load support dashboard analytics:', errorMessage, error);
      setAnalyticsError(errorMessage);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  const handleRefresh = useCallback((filter: string) => {
    setActiveFilter(filter);
    if (filter === activeFilter) {
      void loadAnalytics(filter);
    }
  }, [activeFilter, loadAnalytics]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadAnalytics(activeFilter);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [activeFilter, loadAnalytics]);

  const supportBoard = useMemo(() => buildSupportBoard(analytics), [analytics]);

  const totalOpen = useMemo(
    () =>
      supportBoard.filter((col) => col.title !== 'Resolved').reduce(
        (sum, col) => sum + col.count,
        0
      ),
    [supportBoard]
  );

  return (
    <div className="space-y-5 overflow-x-hidden pb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">
            Support
          </h1>
          <p className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Service queues, escalations, SLA health 
          </p>
          {analyticsError ? (
            <p className="mt-2 text-xs text-rose-600">{analyticsError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleRefresh(filter)}
              disabled={isLoadingAnalytics}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] font-medium transition-all',
                activeFilter === filter
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                isLoadingAnalytics && 'pointer-events-none opacity-50'
              )}
            >
              <RefreshCwIcon
                size={10}
                className={cn(
                  'shrink-0',
                  isLoadingAnalytics && activeFilter === filter && 'animate-spin'
                )}
              />
              <span>{isLoadingAnalytics && activeFilter === filter ? 'Refreshing...' : filter}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CompactStatCard
          title="Open Queue"
          value={`${totalOpen}`}
          icon={<InboxIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">New {formatNumber(analytics?.kpis.openQueue.new)}</span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">In Progress {formatNumber(analytics?.kpis.openQueue.inProgress)}</span>
            </div>
          }
        />

        <CompactStatCard
          title="Critical Escalations"
          value={formatNumber(analytics?.kpis.criticalEscalations.count)}
          icon={<ShieldAlertIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">Immediate Attention</span>
            </div>
          }
        />

        <CompactStatCard
          title="Avg Response Time"
          value={formatNumber(analytics?.kpis.avgResponseTime.actual)}
          icon={<Clock3Icon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Goal {formatNumber(analytics?.kpis.avgResponseTime.goal)}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{formatNumber(analytics?.kpis.avgResponseTime.slaHealth)}</span>
            </div>
          }
        />

        <CompactStatCard
          title="Resolved Today"
          value={formatNumber(analytics?.kpis.resolvedToday.efficiencyPercentage)}
          icon={<CheckCircle2Icon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Efficiency {analytics?.kpis.resolvedToday.efficiencyPercentage !== undefined ? `${analytics.kpis.resolvedToday.efficiencyPercentage}%` : '—'}</span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">Backlog {formatNumber(analytics?.kpis.resolvedToday.backlogCount)}</span>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {supportBoard.map((column) => (
          <div
            key={column.title}
            className="flex h-[620px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="truncate pr-3 text-[12px] font-semibold text-slate-900">
                {column.title}
              </h3>
              <span className="text-[10px] text-slate-500">{column.count}</span>
            </div>

            <div className="support-column-scroll space-y-3 overflow-y-auto pr-1">
              {column.items.map((item) => (
                <SupportCard key={item.id} item={item} />
              ))}

              {column.items.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-[11px] text-slate-400">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex h-[620px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="truncate pr-3 text-[12px] font-semibold text-slate-900">
              Operations Watch
            </h3>
            <span className="text-[10px] text-slate-500">Live</span>
          </div>

          <div className="support-column-scroll space-y-3 overflow-y-auto pr-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <HeadsetIcon size={14} className="text-emerald-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Support staffing healthy
                </p>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Active queue coverage is within expected threshold.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon size={14} className="text-amber-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Telehealth incident cluster
                </p>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Multiple video-session issues reported within the last hour.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ActivityIcon size={14} className="text-blue-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Escalation review in progress
                </p>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Security and data-sync cases are currently being reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .support-column-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .support-column-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .support-column-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 9999px;
        }

        .support-column-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}</style>
    </div>
  );
}
