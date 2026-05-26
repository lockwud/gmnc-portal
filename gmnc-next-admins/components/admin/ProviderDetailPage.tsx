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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-100';
      case 'PENDING_REVIEW':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-100';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

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

  const openActionModal = (action: ProviderVerificationAction) => {
    setPendingAction(action);
    setIsActionModalOpen(true);
  };

  const handleVerificationAction = async (action: ProviderVerificationAction) => {
    if (!provider) return;
    try {
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
        <p className="text-slate-500">Provider not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f7f8fc]">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
              {provider.user.fullName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {provider.user.fullName}
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(provider.verificationStatus)}`}>
                  {provider.verificationStatus.replace('_', ' ')}
                </span>
                {provider.profession && (
                  <span className="text-sm text-slate-500">{provider.profession}</span>
                )}
              </div>
            </div>
          </div>

          {provider.verificationStatus !== 'VERIFIED' && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => openActionModal('APPROVE')}
                className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Approve
                </div>
              </Button>

              <Button
                variant="secondary"
                onClick={() => openActionModal('REQUEST_CHANGES')}
                className="h-11 rounded-xl border border-blue-200 bg-blue-50 px-5 text-blue-700 hover:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <Edit2 size={18} />
                  Request Changes
                </div>
              </Button>

              <button
                onClick={() => openActionModal('REJECT')}
                className="flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-auto bg-[#f7f8fc]">
        <div className="mx-auto max-w-5xl space-y-8 p-8">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Provider Information</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email Address</p>
                    <p className="text-sm font-medium text-slate-900">{provider.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900">{provider.user.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                    <User className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Profession</p>
                    <p className="text-sm font-medium text-slate-900">{provider.profession || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                    <Briefcase className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Specialty</p>
                    <p className="text-sm font-medium text-slate-900">{provider.licenseType || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <IdCard className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">License Number</p>
                    <p className="text-sm font-medium text-slate-900">{provider.licenseNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">License Expiry</p>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.licenseExpiry ? new Date(provider.licenseExpiry).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                    <Building2 className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Facility</p>
                    <p className="text-sm font-medium text-slate-900">{provider.facilityName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
                    <Award className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.experience ? `${provider.experience} years` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Address</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{provider.user.address || 'N/A'}</p>
                  {provider.user.digitalAddress && (
                    <p className="text-sm text-slate-500 mt-1">{provider.user.digitalAddress}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {provider.documents && provider.documents.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {provider.documents.map((doc: ProviderDocument, idx: number) => (
                    <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {doc.type?.startsWith('image') ? (
                        <div className="relative h-48 w-full">
                          <Image
                            src={doc.url}
                            alt={doc.name || 'Document'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                      {doc.name && (
                        <div className="border-t border-slate-200 px-4 py-2">
                          <p className="text-sm font-medium text-slate-900 text-center">{doc.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)}>
        <div className="w-full max-w-lg rounded-3xl bg-white p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            {pendingAction === 'APPROVE' && 'Approve Provider'}
            {pendingAction === 'REJECT' && 'Reject Provider'}
            {pendingAction === 'REQUEST_CHANGES' && 'Request Changes'}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Add optional notes for this action.
          </p>

          <textarea
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            rows={5}
            placeholder="Enter notes..."
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-400"
          />

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <Button className="flex-1 rounded-2xl py-3" onClick={() => handleVerificationAction(pendingAction!)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}