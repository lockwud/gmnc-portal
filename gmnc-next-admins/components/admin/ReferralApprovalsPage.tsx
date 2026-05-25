'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Eye, X } from 'lucide-react';

type ReferralStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ReferralItem = {
  id: string;
  patientName: string;
  referringProvider: string;
  receivingProvider: string;
  status: ReferralStatus;
  createdAt: string;
};

export default function ReferralApprovalsPage() {
  const { show } = useToast();

  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<ReferralItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReferrals = async () => {
      setIsLoading(true);
      try {
        setReferrals([
          {
            id: 'REF-001',
            patientName: 'Emma Thompson',
            referringProvider: 'Dr. Sarah Johnson',
            receivingProvider: 'Dr. Michael Chen',
            status: 'PENDING',
            createdAt: '2026-05-20T10:30:00Z',
          },
          {
            id: 'REF-002',
            patientName: 'James Brown',
            referringProvider: 'Dr. Sarah Johnson',
            receivingProvider: 'Dr. Lisa Wong',
            status: 'PENDING',
            createdAt: '2026-05-19T14:15:00Z',
          },
        ]);
      } catch (err) {
        show({
          title: 'Error',
          message: err instanceof Error ? err.message : 'Failed to load referrals',
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadReferrals();
  }, [show]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const getStatusClass = (status: ReferralStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
      case 'PENDING':
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
      default:
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-[15px] font-semibold text-slate-900">Referral Approvals</h1>
            <p className="text-xs text-slate-400">Review and manage referral requests</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
          <div className="flex h-full min-h-0 flex-col gap-2">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : referrals.length === 0 ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
                <div className="w-full max-w-md">
                  <EmptyState
                    title="No pending referrals"
                    description="All referral requests have been processed."
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white">
                  <div className="h-full overflow-auto scrollbar-none">
                    <table className="w-full min-w-[980px] border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-emerald-600 text-white">
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Patient</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Referring Provider</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Receiving Provider</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Status</th>
                          <th className="px-4 py-3 text-center text-[11px] font-medium">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {referrals.map((referral, index) => (
                          <tr
                            key={referral.id}
                            className={`transition ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            } hover:bg-emerald-50 cursor-pointer`}
                            onClick={() => {
                              setSelectedReferral(referral);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                              {referral.patientName}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                              {referral.referringProvider}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                              {referral.receivingProvider}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                                  referral.status
                                )}`}
                              >
                                {referral.status}
                              </span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-center">
                              <button
                                className="rounded-full bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                                aria-label="View details"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <div className="mx-auto w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Referral: {selectedReferral?.patientName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Referral Details</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {selectedReferral && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-400">Patient</p>
                  <p className="font-medium text-slate-900">{selectedReferral.patientName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-400">Status</p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                      selectedReferral.status
                    )}`}
                  >
                    {selectedReferral.status}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-400">Referring Provider</p>
                  <p className="font-medium text-slate-900">{selectedReferral.referringProvider}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-400">Receiving Provider</p>
                  <p className="font-medium text-slate-900">{selectedReferral.receivingProvider}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-400">Submitted</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedReferral.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 px-3 py-1.5 text-xs" onClick={() => {}}>
                  Approve
                </Button>
                <Button variant="secondary" className="flex-1 px-3 py-1.5 text-xs text-rose-600" onClick={() => {}}>
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}