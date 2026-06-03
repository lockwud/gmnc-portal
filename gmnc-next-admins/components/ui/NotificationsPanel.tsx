'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { COLORS } from '@/lib/colors';
import { useAuth } from '@/lib/context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/lib/api/telehealth';
import type { NotificationItem } from '@/lib/api/types';

type Props = {
  open: boolean;
  onClose: () => void;
  width?: string;
};

const PAGE_SIZE = 15;

const FIVE_MINUTES = 5 * 60 * 1000;

const NotificationsPanel: React.FC<Props> = ({ open, onClose, width = 'w-64' }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const cacheRef = useRef<NotificationItem[]>([]);
  const cacheTimestampRef = useRef<number>(0);

  const refreshNotifications = useCallback(async (isLoadMore = false) => {
    if (!token) {
      return;
    }

    if (!isLoadMore && !isLoadMore && cacheRef.current.length > 0 && Date.now() - cacheTimestampRef.current < FIVE_MINUTES) {
      setNotifications(cacheRef.current);
      setHasMore(cacheRef.current.length > PAGE_SIZE);
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
  }, [token]);

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
    if (open !== panelOpen) {
      setPanelOpen(open);
      if (open && token) {
        refreshNotifications();
        refreshUnreadCount();
      }
    }
  }, [open, panelOpen, token, refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (!panelOpen || !token) return;
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [panelOpen, token, refreshUnreadCount]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      cacheRef.current = [];
      cacheTimestampRef.current = 0;
    }
  }, [token]);

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
      const next = notifications.filter(n => n.id !== id);
      cacheRef.current = next;
      cacheTimestampRef.current = Date.now();
      setNotifications(next);
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('notifications:unread-changed', { detail: { unreadCount: Math.max(0, unreadCount - 1) } }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token || !confirm('Mark all notifications as read?')) return;
    try {
      await markAllNotificationsAsRead(token);
      const next: NotificationItem[] = [];
      cacheRef.current = next;
      cacheTimestampRef.current = Date.now();
      setNotifications(next);
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications:unread-changed', { detail: { unreadCount: 0 } }));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleLoadMore = async () => {
    if (!token || loadingMore) return;
    await refreshNotifications(true);
  };

  if (!open) return null;

  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';
  const visibleNotifications = notifications.slice(0, displayCount);

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
        className={`${width} relative ml-auto h-full bg-white shadow-xl border-l flex flex-col`}
        style={{ borderLeftColor: '#e6e9f2' }}
        role="document"
      >
        <div
          className="px-4 py-3 flex items-start justify-between border-b shrink-0"
          style={{ borderColor: '#e6e9f2' }}
        >
          <div>
            <h2 id="notifications-title" className="text-sm font-semibold" style={{ color: '#111827' }}>
              Notifications
            </h2>
            <p className="text-xs text-gray-500">
              {unreadCount} unread
            </p>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close notifications"
            title=""
            className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-100 text-gray-600 focus:outline-none"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="material-icons text-xs"
              style={{ color: '#374151' }}
              aria-hidden
            >
              close
            </span>
            <style jsx>{`
              button:focus {
                box-shadow: 0 0 0 3px ${activeBg}22;
              }
            `}</style>
          </button>
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
                You're all caught up! New notifications will appear here.
              </div>
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-100 shrink-0">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Mark all as read
                </button>
              </div>
              <div>
                {visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{n.title}</h3>
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[10px] text-gray-500 hover:text-gray-700 shrink-0"
                      >
                        Mark read
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

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
