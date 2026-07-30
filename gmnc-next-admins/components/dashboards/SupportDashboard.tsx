'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import {
  InboxIcon,
  Clock3Icon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ShieldAlertIcon,
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
    <div className="group relative min-h-[132px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold leading-none text-slate-600 dark:text-slate-200">
            {title}
          </p>

          <div className="flex items-center gap-1.5">
            {badge && (
                <Badge className="border-none bg-slate-50 px-1.5 py-0.5 text-[8px] font-medium uppercase leading-none text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                {badge}
              </Badge>
            )}
            <div className="rounded-lg bg-slate-50 p-2 text-slate-400 dark:bg-slate-800 dark:text-slate-200">{icon}</div>
          </div>
        </div>

        <div>
          <h3 className="text-[30px] font-bold leading-none tracking-tight text-slate-950 dark:text-slate-50">
            {value}
          </h3>

          {meta ? (
            <p className="mt-2 line-clamp-1 text-xs leading-none text-slate-400 dark:text-slate-300">
              {meta}
            </p>
          ) : (
            <div className="mt-4 min-h-[24px] text-[10px] font-medium leading-none">
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
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200';

  const colors = ['red', 'blue', 'green', 'amber', 'slate'] as const;

  return (
    <div className="border border-slate-200 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-300">{item.time}</p>
        <span className={cn('rounded-full px-2.5 py-1 text-[9px] font-bold uppercase', priorityClass)}>
          {item.priority}
        </span>
      </div>

      <div className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
        {item.tag}
      </div>

      <div className="mt-3">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-50">
          {item.title}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-300">
          {item.subtitle}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex items-center -space-x-1">
          {item.assignees.map((assignee, index) => (
            <AvatarPill
              key={assignee}
              text={assignee}
              color={colors[index % colors.length]}
            />
          ))}
          <div className="flex h-6 items-center rounded-full border border-slate-200 bg-amber-50 px-1.5 text-[9px] font-bold text-slate-600 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {item.more}
          </div>
        </div>

        <span className="shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-300">{item.ref}</span>
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-6 overflow-hidden">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            Support
          </h1>
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
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                activeFilter === filter
                  ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
                isLoadingAnalytics && 'pointer-events-none opacity-50'
              )}
            >
              <RefreshCwIcon
                 size={12}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompactStatCard
          title="Open Queue"
          value={`${totalOpen}`}
          icon={<InboxIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600 dark:bg-blue-950 dark:text-blue-200">New {formatNumber(analytics?.kpis.openQueue.new)}</span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600 dark:bg-amber-950 dark:text-amber-200">In Progress {formatNumber(analytics?.kpis.openQueue.inProgress)}</span>
            </div>
          }
        />

        <CompactStatCard
          title="Critical Escalations"
          value={formatNumber(analytics?.kpis.criticalEscalations.count)}
          icon={<ShieldAlertIcon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600 dark:bg-rose-950 dark:text-rose-200">Immediate Attention</span>
            </div>
          }
        />

        <CompactStatCard
          title="Avg Response Time"
          value={formatNumber(analytics?.kpis.avgResponseTime.actual)}
          icon={<Clock3Icon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-200">Goal {formatNumber(analytics?.kpis.avgResponseTime.goal)}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200">{formatNumber(analytics?.kpis.avgResponseTime.slaHealth)}</span>
            </div>
          }
        />

        <CompactStatCard
          title="Resolved Today"
          value={formatNumber(analytics?.kpis.resolvedToday.efficiencyPercentage)}
          icon={<CheckCircle2Icon size={14} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-200">Efficiency {analytics?.kpis.resolvedToday.efficiencyPercentage !== undefined ? `${analytics.kpis.resolvedToday.efficiencyPercentage}%` : '—'}</span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600 dark:bg-blue-950 dark:text-blue-200">Backlog {formatNumber(analytics?.kpis.resolvedToday.backlogCount)}</span>
            </div>
          }
        />
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-4 xl:grid-cols-3">
        {supportBoard.map((column) => (
          <div
            key={column.title}
            className="flex h-full min-h-[720px] min-w-0 flex-col border border-slate-200 bg-white p-3 xl:min-h-0"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="truncate pr-3 text-sm font-bold text-slate-950 dark:text-slate-50">
                {column.title}
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{column.count}</span>
            </div>

            <div className="support-column-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {column.items.map((item) => (
                <SupportCard key={item.id} item={item} />
              ))}

              {column.items.length === 0 && (
                <div className="flex h-40 items-center justify-center border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
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
