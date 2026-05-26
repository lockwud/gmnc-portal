'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { getPatientAssessments } from '@/lib/api/assessments';
import { AssessmentListItem } from '@/lib/api/types';
import { formatDateTime, statusPillClass } from '@/utils/assessment';
import { AssessmentHistorySkeleton } from './AssessmentSkeletons';

export default function AssessmentListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const patientName = searchParams.get('patientName');
  const patientGender = searchParams.get('patientGender');
  const patientDob = searchParams.get('patientDob');
  const caregiverName = searchParams.get('caregiverName');

  const [items, setItems] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!patientId) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getPatientAssessments(patientId);
        if (!active) return;
        setItems(data.assessments || []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load assessments.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [patientId]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = a.assessedAt ? new Date(a.assessedAt).getTime() : 0;
      const bTime = b.assessedAt ? new Date(b.assessedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [items]);

  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedItems]);

  useEffect(() => {
    const upcomingItems = sortedItems.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize
    );

    upcomingItems.forEach((item) => {
      void router.prefetch(`/provider/assessments/${item.id}/report`);
    });
  }, [currentPage, pageSize, router, sortedItems]);

  const handleCreate = () => {
    if (patientId) {
      router.push(`/provider/assessments/create?patientId=${patientId}`);
    } else {
      router.push('/provider/assessments/create');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const reportHref = (item: AssessmentListItem) => {
    const params = new URLSearchParams();
    if (item.toolCode) params.set('toolCode', item.toolCode);
    if (item.status) params.set('status', item.status);
    if (item.assessedAt) params.set('assessedAt', item.assessedAt);
    if (patientName) params.set('patientName', patientName);
    if (patientGender) params.set('patientGender', patientGender);
    if (patientDob) params.set('patientDob', patientDob);
    if (caregiverName) params.set('caregiverName', caregiverName);
    const query = params.toString();
    return `/provider/assessments/${item.id}/report${query ? `?${query}` : ''}`;
  };

  if (!patientId) {
    return (
      <div className="flex h-[calc(100vh-110px)] items-center justify-center bg-white">
        <EmptyState
          title="Select a patient first"
          description="Open a patient profile and launch assessments from there for a smoother workflow."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Assessments</h1>
          <p className="mt-1 text-xs text-slate-500">
            Review patient assessment history and create a new assessment.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Create
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-slate-50 px-4 py-4">
        <div className="flex h-full min-h-0 flex-col">
          {loading ? (
            <AssessmentHistorySkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : totalItems === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-md">
                <EmptyState
                  title="No assessments yet"
                  description="This patient has no assessment history yet. Create the first assessment to begin clinical tracking."
                />
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-none">
                <div className="space-y-3">
                  {paginatedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => router.push(reportHref(item))}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {item.toolCode}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusPillClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>Version: {item.toolVersion || '1.0.0'}</span>
                            <span>Assessed: {formatDateTime(item.assessedAt)}</span>
                          </div>

                          {item.report?.summary ? (
                            <p className="line-clamp-2 text-sm text-slate-600">
                              {item.report.summary}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400">
                              No summary available.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center">
                          <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                            View report
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setPage}
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
