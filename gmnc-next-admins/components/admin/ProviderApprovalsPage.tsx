'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { Eye } from 'lucide-react';
import { getProvidersWaitingVerification, Provider } from '@/lib/api/providers';

export default function ProviderApprovalsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      try {
        const data = await getProvidersWaitingVerification();
        setProviders(data);
      } catch (err) {
        console.error('Failed to load providers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProviders();
  }, []);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
      case 'PENDING_REVIEW':
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
      default:
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Provider Approvals</h1>
          <p className="text-xs text-slate-400">Review and manage provider registrations</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
        <div className="flex h-full min-h-0 flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
              <div className="w-full max-w-md">
                <EmptyState
                  title="No pending providers"
                  description="All provider registrations have been processed."
                />
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white">
              <div className="h-full overflow-auto scrollbar-none">
                <table className="w-full min-w-[980px] border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-4 py-3 text-left text-[11px] font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium">Specialty</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium">Registered</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {providers.map((provider, index) => (
                      <tr
                        key={provider.id}
                        className={`transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        } hover:bg-emerald-50 cursor-pointer`}
                      >
                        <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                          {provider.user.fullName}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                          {provider.user.email}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                          {provider.profession}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                              provider.verificationStatus
                            )}`}
                          >
                            {provider.verificationStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                          {formatDate(provider.createdAt)}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-center">
                          <Link
                            href={`/admin/approvals/providers/${provider.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            aria-label="View details"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}