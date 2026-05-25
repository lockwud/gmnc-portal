'use client';

import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '@/lib/colors';
import { useAuth } from '@/lib/context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/telehealth';
import type { NotificationItem } from '@/lib/api/types';

type Props = {
  open: boolean;
  onClose: () => void;
  width?: string;
};

const NotificationsPanel: React.FC<Props> = ({ open, onClose, width = 'w-64' }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !token) return;

    async function loadNotifications() {
      setLoading(true);
      try {
        const data = await getNotifications(token);
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        if (err instanceof Error) {
          console.error('Error details:', err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [open, token]);

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
      setNotifications(n => n.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token || !confirm('Mark all notifications as read?')) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!open) return null;

  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';

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
        <div className="px-4 py-3 flex items-start justify-between border-b" style={{ borderColor: '#e6e9f2' }}>
          <div>
            <h2 id="notifications-title" className="text-sm font-semibold" style={{ color: '#111827' }}>
              Notifications
            </h2>
            <p className="text-xs text-gray-500">{notifications.length} unread</p>
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

        <div className="p-0 flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center">
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
              <div className="p-2 border-b border-gray-100">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{n.title}</h3>
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[10px] text-gray-500 hover:text-gray-700"
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
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationsPanel;