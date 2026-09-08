'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

type AdminAppointment = {
  id: string;
  appointmentDate: string;
  status: string;
  patient?: { id: string; fullName?: string } | null;
  provider?: { id: string; profession?: string; user?: { fullName?: string } | null } | null;
};

function statusBadge(status: string) {
  const upper = status.toUpperCase();
  if (upper === 'APPROVED' || upper === 'COMPLETED' || upper === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700';
  if (upper === 'DECLINED' || upper === 'CANCELLED') return 'bg-rose-50 text-rose-700';
  return 'bg-amber-50 text-amber-700';
}

/**
 * Admin appointments overview (read-only). Approval and rescheduling stay
 * with service providers — the backend exposes no admin mutation here —
 * so this page is oversight: filter by date/month and inspect the queue.
 */
export default function AdminAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <AppointmentsOverview />
    </ProtectedRoute>
  );
}

function AppointmentsOverview() {
  const { token } = useAuth();
  const { show } = useToast();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState('');
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      else if (month) params.set('month', month);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/appointment/admin${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data as { message?: string })?.message ?? 'Failed to load appointments');
      }
      const list = (data as { data?: unknown })?.data;
      setAppointments(Array.isArray(list) ? (list as AdminAppointment[]) : []);
    } catch (error) {
      show({ type: 'error', title: 'Appointments unavailable', message: error instanceof Error ? error.message : 'Failed to load appointments' });
    } finally {
      setLoading(false);
    }
  }, [month, date, token, show]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-950">Appointments Overview</h1>
          <p className="mt-1 text-xs text-slate-500">
            Every appointment on the platform. Approval and rescheduling belong to providers — this view is oversight only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-slate-600">
            Month{' '}
            <input
              type="month"
              value={month}
              onChange={(e) => { setMonth(e.target.value); setDate(''); }}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none"
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Day{' '}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none"
            />
          </label>
          {date ? (
            <button
              type="button"
              onClick={() => setDate('')}
              className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Clear day
            </button>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments" description="Nothing scheduled for this period." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{appointment.patient?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {appointment.provider?.user?.fullName ?? '—'}
                    {appointment.provider?.profession ? (
                      <span className="block text-[11px] text-slate-400">{appointment.provider.profession.replace(/_/g, ' ')}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge(appointment.status)}`}>
                      {appointment.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
