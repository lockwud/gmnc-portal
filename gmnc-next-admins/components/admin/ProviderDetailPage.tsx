'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

import {
  CheckCircle2,
  XCircle,
  Edit2,
  Mail,
  Phone,
  User,
  Briefcase,
  IdCard,
  Calendar,
  Building2,
  Award,
  MapPin,
} from 'lucide-react';

import {
  getProviderById,
  verifyProvider,
  Provider,
  ProviderVerificationAction,
  ProviderDocument,
} from '@/lib/api/providers';

export default function ProviderDetailPage({
  providerId,
}: {
  providerId: string;
}) {
  const router = useRouter();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const [pendingAction, setPendingAction] =
    useState<ProviderVerificationAction | null>(null);

  const [actionNote, setActionNote] = useState('');

  const [activeTab, setActiveTab] = useState<
    'documents' | 'notes' | 'activity'
  >('documents');

  useEffect(() => {
    const loadProvider = async () => {
      setIsLoading(true);

      try {
        const data = await getProviderById(providerId);
        setProvider(data);
      } catch (err) {
        console.error('Failed to load provider:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();
  }, [providerId]);

  const openActionModal = (
    action: ProviderVerificationAction
  ) => {
    setPendingAction(action);
    setIsActionModalOpen(true);
  };

  const handleVerificationAction = async (
    action: ProviderVerificationAction
  ) => {
    if (!provider) return;

    try {
      // Always send a string for verificationNote (empty string if not typed)
      await verifyProvider(
        provider.id,
        action,
        actionNote ?? '',
        action === 'APPROVE' ? 'ACTIVE' : undefined
      );

      router.push('/admin/approvals/providers');
    } catch (err) {
      console.error('Failed to verify provider:', err);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-700';

      case 'PENDING_REVIEW':
        return 'bg-amber-100 text-amber-700';

      case 'REJECTED':
        return 'bg-rose-100 text-rose-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <p className="text-slate-500">
          Provider not found
        </p>
      </div>
    );
  }

  const details = [
    {
      label: 'Email Address',
      value: provider.user.email,
      icon: Mail,
      color: 'text-blue-500',
    },
    {
      label: 'Phone Number',
      value: provider.user.phoneNumber,
      icon: Phone,
      color: 'text-green-500',
    },
    {
      label: 'Profession',
      value: provider.profession,
      icon: User,
      color: 'text-violet-500',
    },
    {
      label: 'Specialty',
      value: provider.licenseType,
      icon: Briefcase,
      color: 'text-cyan-500',
    },
    {
      label: 'License Number',
      value: provider.licenseNumber,
      icon: IdCard,
      color: 'text-emerald-500',
    },
    {
      label: 'License Expiry',
      value: new Date(
        provider.licenseExpiry
      ).toLocaleDateString(),
      icon: Calendar,
      color: 'text-orange-500',
    },
    {
      label: 'Facility',
      value: provider.facilityName,
      icon: Building2,
      color: 'text-sky-500',
    },
    {
      label: 'Experience',
      value: `${provider.experience} years`,
      icon: Award,
      color: 'text-pink-500',
    },
  ];

return (
    <>
      <div className="flex h-screen flex-col bg-[#f7f8fc]">
        {/* TOP HEADER */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-8 py-5">
            {/* LEFT */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                {provider.user.fullName?.charAt(0)}
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {provider.user.fullName}
                </h1>

                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      provider.verificationStatus
                    )}`}
                  >
                    {provider.verificationStatus.replace(
                      '_',
                      ' '
                    )}
                  </span>

                  <span className="text-sm text-slate-500">
                    {provider.profession}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            {provider.verificationStatus !==
              'VERIFIED' && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    openActionModal('APPROVE')
                  }
                  className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    Approve
                  </div>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    openActionModal(
                      'REQUEST_CHANGES'
                    )
                  }
                  className="h-11 rounded-xl border border-blue-200 bg-blue-50 px-5 text-blue-700 hover:bg-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <Edit2 size={18} />
                    Request Changes
                  </div>
                </Button>

                <button
                  onClick={() =>
                    openActionModal('REJECT')
                  }
                  className="flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-[360px_1fr]">
            {/* LEFT SIDEBAR - PROVIDER DETAILS */}
          <div className="h-full flex flex-col overflow-y-auto scrollbar-none border-r border-slate-200 bg-white">
            {/* SECTION HEADER */}
            <div className="border-b border-slate-200 px-6 py-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Provider Details
              </h2>
            </div>

            {/* DETAILS */}
            <div className="flex-1 space-y-8 px-6 py-7">
              {details.map((item, idx) => {
                const Icon = item.icon;

                return (
                  <div key={idx}>
                    <div className="mb-2 flex items-center gap-3">
                      <Icon
                        size={18}
                        className={item.color}
                      />

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                    </div>

                    <p className="pl-7 text-sm font-medium leading-relaxed text-slate-900">
                      {item.value || 'N/A'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ADDRESS */}
            <div className="border-t border-slate-200 px-6 py-7">
              <div className="mb-2 flex items-center gap-3">
                <MapPin
                  size={18}
                  className="text-emerald-600"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Address
                </p>
              </div>

              <p className="pl-7 text-sm font-medium text-slate-900">
                {provider.user.address}
              </p>

              <p className="mt-2 pl-7 text-sm text-slate-500">
                {provider.user.digitalAddress}
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT - DOCUMENTS */}
          <div className="h-full bg-[#fafbff]">
            {/* TABS */}
            <div className="flex items-center gap-8 border-b border-slate-200 bg-white px-8">
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-4 pt-5 text-sm font-medium ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                Documents
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-4 pt-5 text-sm font-medium ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                Verification Notes
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 pt-5 text-sm font-medium ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                Activity
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-8">
              {/* DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-10">
                  {/* LICENSE */}
                  {provider.licenseImage && (
                    <div>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-900">
                          License Document
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Uploaded provider license
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="relative h-60 w-full">
                          <Image
                            src={provider.licenseImage}
                            alt="License"
                            fill
                            priority
                            className="object-contain"
                            sizes="100vw"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADDITIONAL DOCUMENTS */}
                  {provider.documents &&
                    Array.isArray(provider.documents) &&
                    provider.documents.length > 0 && (
                      <div>
                        <h3 className="mb-5 text-lg font-semibold text-slate-900">
                          Additional Documents
                        </h3>

                        <div className="grid gap-6 lg:grid-cols-2">
                          {provider.documents.map(
                            (doc: ProviderDocument, idx: number) => (
                              <div
                                key={idx}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                              >
                                {doc.type?.startsWith('image') ? (
                                  <div className="relative h-[420px]">
                                    <Image
                                      src={doc.url}
                                      alt={doc.name || 'Document'}
                                      fill
                                      className="object-cover"
                                      sizes="50vw"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-[240px] items-center justify-center">
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-xl bg-emerald-100 px-5 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                                    >
                                      Open Document
                                    </a>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* NOTES */}
              {activeTab === 'notes' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Verification Notes
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    No verification notes yet.
                  </p>
                </div>
              )}

              {/* ACTIVITY */}
              {activeTab === 'activity' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Activity
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    No recent activity.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* MODAL */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
      >
        <div className="w-full max-w-lg rounded-3xl bg-white p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            {pendingAction === 'APPROVE' && 'Approve Provider'}

            {pendingAction === 'REJECT' && 'Reject Provider'}

            {pendingAction ===
              'REQUEST_CHANGES' &&
              'Request Changes'}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Add optional notes for this action.
          </p>

          <textarea
            value={actionNote}
            onChange={(e) =>
              setActionNote(e.target.value)
            }
            rows={5}
            placeholder="Enter notes..."
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-400"
          />

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setIsActionModalOpen(false)
              }
              className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <Button
              className="flex-1 rounded-2xl py-3"
              onClick={() => {
                if (pendingAction) {
                  handleVerificationAction(
                    pendingAction
                  );
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}