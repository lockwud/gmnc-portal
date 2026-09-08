'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { getIncomingReferrals, getOutgoingReferrals } from '@/lib/api/referrals';
import type { ReferralListItem } from '@/lib/api/types';

function statusBadge(status: string) {
  if (status === 'ACCEPTED' || status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'DECLINED') return 'bg-rose-50 text-rose-700';
  return 'bg-amber-50 text-amber-700';
}

/**
 * Admin referral oversight. The backend exposes no separate admin referral
 * endpoint — instead the standard incoming/outgoing endpoints return every
 * referral for ADMIN callers, which is what this page reads (no mock data).
 */
export default function AdminReferralManagementRoute() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <ReferralsOverview />
    </ProtectedRoute>
  );
}

function ReferralsOverview() {
  const { show } = useToast();
  const [tab, setTab] = useState<'outgoing' | 'incoming'>('outgoing');
  const [referrals, setReferrals] = useState<ReferralListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = tab === 'outgoing' ? await getOutgoingReferrals() : await getIncomingReferrals();
      setReferrals(result.referrals ?? []);
    } catch (error) {
      show({ type: 'error', title: 'Referrals unavailable', message: error instanceof Error ? error.message : 'Failed to load referrals' });
    } finally {
      setLoading(false);
    }
  }, [tab, show]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-950">Referral Oversight</h1>
          <p className="mt-1 text-xs text-slate-500">
            Every referral on the platform. Status changes stay with the involved providers; admins oversee but do not adjudicate here.
          </p>
        </div>
        <div className="flex gap-2">
          {(['outgoing', 'incoming'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${tab === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : referrals.length === 0 ? (
        <EmptyState title="No referrals" description={`Nothing in the ${tab} queue right now.`} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {referral.patient?.fullName ?? '—'}
                    <span className="block text-[11px] font-normal text-slate-500">ID: {referral.patientId.slice(0, 8)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{referral.fromProvider?.user?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {referral.toProvider?.user?.fullName ?? `Any ${referral.toProfession.replace(/_/g, ' ')}`}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-slate-600" title={referral.reason}>
                    {referral.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge(referral.status)}`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : '—'}
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
