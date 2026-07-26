'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCheck, Circle, X } from 'lucide-react';
import { COLORS } from '@/lib/colors';
import { useAuth } from '@/lib/context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/lib/api/notifications';
import type { NotificationItem } from '@/lib/api/types';

type Props = {
  open: boolean;
  onClose: () => void;
  width?: string;
};

const PAGE_SIZE = 15;

const FIVE_MINUTES = 5 * 60 * 1000;

const NotificationsPanel: React.FC<Props> = ({ open, onClose, width = 'w-full max-w-[380px]' }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const cacheRef = useRef<NotificationItem[]>([]);
  const cacheTimestampRef = useRef<number>(0);

  const refreshNotifications = useCallback(async (isLoadMore = false) => {
    if (!token) {
      return;
    }

    if (!isLoadMore && cacheRef.current.length > 0 && Date.now() - cacheTimestampRef.current < FIVE_MINUTES) {
      setNotifications(cacheRef.current);
      setHasMore(cacheRef.current.length > displayCount);
      return;
    }

    setLoading(!isLoadMore);
    setLoadingMore(isLoadMore);
    try {
      const data = await getNotifications(token);
      const items = data.notifications || [];
      cacheRef.current = items;
      cacheTimestampRef.current = Date.now();
      setNotifications(items);
      setHasMore(items.length > PAGE_SIZE);
      setDisplayCount(PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [displayCount, token]);

  const refreshUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await getUnreadNotificationCount(token);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, [token]);

  useEffect(() => {
    if (open && token) {
      const timeout = window.setTimeout(() => {
        void refreshNotifications();
        void refreshUnreadCount();
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [open, token, refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (!open || !token) return;
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [open, token, refreshUnreadCount]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationAsRead(id, token);
      const next = notifications.map((notification) => (
        notification.id === id
          ? { ...notification, status: 'READ' as const }
          : notification
      ));
      cacheRef.current = next;
      cacheTimestampRef.current = 0;
      setNotifications(next);
      const nextUnreadCount = next.filter((notification) => notification.status === 'UNREAD').length;
      setUnreadCount(nextUnreadCount);
      window.dispatchEvent(new CustomEvent('notifications:unread-changed', { detail: { unreadCount: nextUnreadCount } }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(token);
      const next = notifications.map((notification) => ({
        ...notification,
        status: notification.status === 'ARCHIVED' ? notification.status : 'READ' as const,
      }));
      cacheRef.current = next;
      cacheTimestampRef.current = 0;
      setNotifications(next);
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications:unread-changed', { detail: { unreadCount: 0 } }));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleLoadMore = async () => {
    if (!token || loadingMore) return;
    const nextCount = Math.min(notifications.length, displayCount + PAGE_SIZE);
    setDisplayCount(nextCount);
    setHasMore(nextCount < notifications.length);
  };

  if (!open) return null;

  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';
  const visibleNotifications = notifications.slice(0, displayCount);
  const unreadNotifications = visibleNotifications.filter((notification) => notification.status === 'UNREAD');
  const readNotifications = visibleNotifications.filter((notification) => notification.status !== 'UNREAD');

  const renderNotification = (notification: NotificationItem) => {
    const isUnread = notification.status === 'UNREAD';

    return (
      <div
        key={notification.id}
        onClick={(event) => {
          event.stopPropagation();
          if (isUnread) void handleMarkAsRead(notification.id);
        }}
        className={`border-b border-gray-100 p-3 last:border-0 transition hover:bg-gray-50 ${
          isUnread ? 'bg-emerald-50/40' : 'bg-white'
        } ${isUnread ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (isUnread) void handleMarkAsRead(notification.id);
            }}
            disabled={!isUnread}
            aria-label={isUnread ? 'Mark notification as read' : 'Notification is read'}
            title={isUnread ? 'Mark as read' : 'Read'}
            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
              isUnread
                ? 'border-emerald-400 bg-white text-emerald-600 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-100 text-slate-300'
            }`}
          >
            <Circle size={8} fill={isUnread ? 'currentColor' : 'none'} strokeWidth={isUnread ? 0 : 2} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`truncate text-sm ${isUnread ? 'font-semibold text-gray-950' : 'font-medium text-gray-700'}`}>
                {notification.title}
              </h3>
              <span className="shrink-0 text-[10px] text-gray-400">
                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{notification.content}</p>
            <p className="mt-1 text-[10px] text-gray-400">
              {new Date(notification.createdAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      aria-modal="true"
      role="dialog"
      aria-labelledby="notifications-title"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`${width} relative ml-auto h-full bg-white shadow-2xl border-l flex flex-col`}
        style={{ borderLeftColor: '#e6e9f2' }}
        role="document"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="px-6 py-5 flex items-start justify-between border-b shrink-0"
          style={{ borderColor: '#e6e9f2' }}
        >
          <div>
            <h2 id="notifications-title" className="text-lg font-bold" style={{ color: '#111827' }}>
              Notifications
            </h2>
            <p className="text-xs text-gray-500">
              {unreadCount} unread
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              aria-label="Mark all notifications as read"
              title="Mark all as read"
              className="flex h-7 w-7 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <CheckCheck size={15} />
            </button>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close notifications"
              title="Close"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-100 text-gray-600 focus:outline-none"
              style={{ boxShadow: 'none' }}
            >
              <X size={14} />
              <style jsx>{`
                button:focus {
                  box-shadow: 0 0 0 3px ${activeBg}22;
                }
              `}</style>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center h-full">
              <span
                className="material-icons mb-4"
                style={{ fontSize: 44, color: '#9CA3AF' }}
                aria-hidden
              >
                notifications_none
              </span>
              <div className="text-sm font-semibold text-gray-700 mb-1">No notifications</div>
              <div className="text-xs text-gray-400 max-w-[220px]">
                You&apos;re all caught up! New notifications will appear here.
              </div>
            </div>
          ) : (
            <>
              <div>
                {unreadNotifications.length > 0 ? (
                  <section>
                    <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Unread
                    </div>
                    {unreadNotifications.map(renderNotification)}
                  </section>
                ) : null}

                {readNotifications.length > 0 ? (
                  <section>
                    <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Read
                    </div>
                    {readNotifications.map(renderNotification)}
                  </section>
                ) : null}

                {hasMore && (
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading...' : `Load more (${notifications.length - displayCount} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationsPanel;
