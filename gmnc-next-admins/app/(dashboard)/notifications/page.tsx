'use client';

import * as React from 'react';
import { AlertCircle, Bell, Clock, Filter, MoreVertical, ShieldCheck, UserPlus } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type NotificationRecord = {
  id: string;
  title?: string | null;
  content?: string | null;
  message?: string | null;
  type?: string | null;
  isRead?: boolean | null;
  read?: boolean | null;
  createdAt?: string | null;
};

function getRecords(payload: unknown): NotificationRecord[] {
  if (Array.isArray(payload)) return payload as NotificationRecord[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (Array.isArray(data)) return data as NotificationRecord[];
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.notifications)) return nested.notifications as NotificationRecord[];
    if (Array.isArray(nested.items)) return nested.items as NotificationRecord[];
    if (Array.isArray(nested.data)) return nested.data as NotificationRecord[];
  }

  if (Array.isArray(record.notifications)) return record.notifications as NotificationRecord[];
  if (Array.isArray(record.items)) return record.items as NotificationRecord[];

  return [];
}

function formatDate(value?: string | null) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getIcon(type?: string | null) {
  const normalized = type?.toLowerCase() ?? '';
  if (normalized.includes('user')) return UserPlus;
  if (normalized.includes('approval') || normalized.includes('verification')) return ShieldCheck;
  if (normalized.includes('system') || normalized.includes('alert')) return AlertCircle;
  return Bell;
}

export default function NotificationsRoute() {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notification?limit=50&unreadOnly=${unreadOnly}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.message || 'Failed to load notifications');
      }

      setNotifications(getRecords(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  const markAllAsRead = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/notification/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.message || 'Failed to mark notifications as read');
      }

      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notifications as read');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 overflow-auto pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Live notification feed from the backend.</p>
          {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2 border border-slate-200 bg-white text-slate-700"
            onClick={() => setUnreadOnly((current) => !current)}
            disabled={loading || saving}
          >
            <Filter size={18} /> {unreadOnly ? 'Showing unread' : 'All notifications'}
          </Button>

          <Button
            variant="secondary"
            className="font-bold text-emerald-600 hover:bg-emerald-50"
            onClick={markAllAsRead}
            disabled={loading || saving || notifications.length === 0}
          >
            {saving ? 'Saving...' : 'Mark all as read'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">No notifications returned by the API.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const isUnread = !(notification.isRead ?? notification.read ?? false);
            const content = notification.content || notification.message || '';

            return (
              <Card
                key={notification.id}
                className={cn('group relative overflow-hidden p-5 transition-all hover:border-slate-300', isUnread && 'border-emerald-100 bg-emerald-50/20')}
              >
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-bold text-slate-950">{notification.title || 'Notification'}</h4>
                      {isUnread ? (
                        <>
                          <Badge color="yellow" className="flex h-2 w-2 items-center justify-center rounded-full p-0 animate-pulse">
                            <span className="sr-only">New</span>
                          </Badge>
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600">New</span>
                        </>
                      ) : null}
                    </div>

                    {content ? <p className="text-sm text-slate-600">{content}</p> : null}

                    <div className="mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock size={14} /> {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  <Button variant="secondary" className="min-h-0 bg-transparent p-2 text-slate-300 shadow-none hover:bg-slate-50 hover:text-slate-700">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
