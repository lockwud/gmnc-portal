'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { getProvidersForVerification, Provider, type ProviderVerificationStatus } from '@/lib/api/providers';

const STATUS_FILTERS: Array<{ value: 'ALL' | ProviderVerificationStatus; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_REVIEW', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function ProviderApprovalsPage() {
  const router = useRouter();
  const { show } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProviderVerificationStatus>('PENDING_REVIEW');

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      try {
        const data = await getProvidersForVerification();
        setProviders(data);
      } catch (err) {
        console.error('Failed to load providers:', err);
        show({
          title: 'Error',
          message: 'Failed to load providers. Please try again.',
          type: 'error',
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProviders();
  }, [show]);

  const filteredProviders = providers.filter((provider) => (
    statusFilter === 'ALL' || provider.verificationStatus === statusFilter
  ));

  const totalItems = filteredProviders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

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
      case 'SUSPENDED':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';
      default:
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }
  };

  const handleRowClick = (providerId: string) => {
    router.push(`/admin/approvals/providers/${providerId}`);
  };

  const getPaginatedProviders = () => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProviders.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: 'ALL' | ProviderVerificationStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const paginatedProviders = getPaginatedProviders();

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Provider Approvals</h1>
          <p className="text-xs text-slate-400">Review and manage provider registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                statusFilter === filter.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
        <div className="flex h-full min-h-0 flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white rounded-lg">
              <div className="w-full max-w-md">
                <EmptyState
                  title="No providers found"
                  description="There are no provider registrations for the selected verification status."
                />
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 rounded-t-lg bg-white">
                <div className="h-full overflow-auto scrollbar-none">
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-emerald-600">
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white rounded-tl-lg">Name</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Email</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Specialty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white rounded-tr-lg">Registered</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProviders.map((provider, index) => (
                        <tr
                          key={provider.id}
                          onClick={() => handleRowClick(provider.id)}
                          className={`transition cursor-pointer ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                          } hover:bg-emerald-50`}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-slate-200 border-t-0 rounded-b-lg bg-white">
                <Pagination
                  page={safeCurrentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
