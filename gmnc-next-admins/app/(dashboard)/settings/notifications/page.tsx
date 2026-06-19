'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft, Bell, CheckCircle, Archive } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/notifications';
import type { NotificationItem, NotificationPriority } from '@/lib/api/types';

export default function NotificationsSettingsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getNotifications(token);
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationAsRead(id, token);
      setNotifications(n => n.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token || !confirm('Mark all notifications as read?')) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };

  const getStatusClass = (priority: NotificationPriority | undefined) => {
    switch (priority) {
      case 'warning': return 'bg-amber-50 text-amber-700';
      case 'error': return 'bg-red-50 text-red-700';
      case 'success': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  return (
    <ProtectedRoute>
      
    <div className="w-full pb-8 pt-4">
      <div className="w-full px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Notification Preferences</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure notification channels and preferences.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={handleMarkAllAsRead}
            className="text-[11px] text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-slate-500">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-400">
            No notifications found
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getStatusClass(n.priority)}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-900">{n.title}</h3>
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-700"
                    >
                      Mark read
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{n.content}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
)
}