'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/context/AuthContext';

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
  MapPin,
  FileText,
  Shield,
  Clock,
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
  const { token } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<ProviderVerificationAction | null>(null);
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    const loadProvider = async () => {
      setIsLoading(true);
      try {
        const data = await getProviderById(providerId, token ?? undefined);
        setProvider(data);
      } catch (err) {
        console.error('Failed to load provider:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();
  }, [providerId, token]);

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
        action === 'APPROVE' ? 'ACTIVE' : undefined,
        token ?? undefined
      );
      router.push('/admin/approvals/providers');
    } catch (err) {
      console.error('Failed to verify provider:', err);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'PENDING_REVIEW':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-slate-600">Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-500">Provider not found</p>
        </div>
      </div>
    );
  }

  const statusVariant = getStatusVariant(provider.verificationStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="h-screen max-h-screen overflow-y-auto scrollbar-none px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <header className="border-b border-slate-200 pb-6">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-700">
                  {provider.user.fullName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold text-slate-900">
                      {provider.user.fullName}
                    </h1>
                    {provider.verificationStatus === 'VERIFIED' && (
                      <Shield className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full ${statusVariant.bg} border ${statusVariant.border} px-3 py-1`}>
                      <span className={`h-2 w-2 rounded-full ${statusVariant.dot}`} />
                      <span className={`text-xs font-semibold ${statusVariant.text}`}>
                        {provider.verificationStatus.replace('_', ' ')}
                      </span>
                    </div>
                    {provider.profession && (
                      <p className="text-sm font-medium text-slate-600">
                        {provider.profession}
                      </p>
                    )}
                    {provider.experience && (
                      <p className="text-sm text-slate-500">
                        {provider.experience} years experience
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {provider.verificationStatus !== 'VERIFIED' && (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    onClick={() => openActionModal('APPROVE')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={18} />
                    Approve
                  </Button>
                  <Button
                    onClick={() => openActionModal('REQUEST_CHANGES')}
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100"
                  >
                    <Edit2 size={18} />
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => openActionModal('REJECT')}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-700 transition-all hover:bg-rose-100"
                  >
                    <XCircle size={18} />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </header>

          <main className="w-full">
            <div className="space-y-12">
              <section>
                <h2 className="mb-6 text-xl font-semibold text-slate-900">Professional Information</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2.5">
                        <Mail size={20} className="text-blue-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.user.email}
                    </p>
                  </div>

                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-green-50 p-2.5">
                        <Phone size={20} className="text-green-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phone
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.user.phoneNumber || '—'}
                    </p>
                  </div>

                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-violet-50 p-2.5">
                        <User size={20} className="text-violet-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Profession
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.profession || '—'}
                    </p>
                  </div>

                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-50 p-2.5">
                        <Briefcase size={20} className="text-cyan-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Specialty
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.licenseType || '—'}
                    </p>
                  </div>

                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2.5">
                        <IdCard size={20} className="text-emerald-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        License #
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.licenseNumber || '—'}
                    </p>
                  </div>

                  <div className="group">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-orange-50 p-2.5">
                        <Calendar size={20} className="text-orange-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Expires
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.licenseExpiry
                        ? new Date(provider.licenseExpiry).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-6 text-xl font-semibold text-slate-900">Facility & Location</h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-sky-50 p-2.5">
                        <Building2 size={20} className="text-sky-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Facility
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.facilityName || '—'}
                    </p>
                    {provider.facilityType && (
                      <p className="mt-1 text-xs text-slate-500">
                        {provider.facilityType.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-rose-50 p-2.5">
                        <MapPin size={20} className="text-rose-600" />
                      </div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Address
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.user.address || '—'}
                    </p>
                    {provider.user.digitalAddress && (
                      <p className="mt-1 text-xs text-slate-500">
                        Digital: {provider.user.digitalAddress}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {provider.licenseImage && (
                <section>
                  <h2 className="mb-6 text-xl font-semibold text-slate-900">License Image</h2>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={provider.licenseImage}
                        alt="License"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </section>
              )}

              {provider.verifiedAt && (
                <section>
                  <h2 className="mb-6 text-xl font-semibold text-slate-900">Activity Timeline</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 rounded-xl bg-emerald-50 px-6 py-4 border border-emerald-200">
                      <div className="rounded-lg bg-emerald-100 p-2.5">
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-emerald-900">
                          Verified on {new Date(provider.verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">Provider approval completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-6 py-4 border border-slate-200">
                      <div className="rounded-lg bg-slate-200 p-2.5">
                        <Clock size={20} className="text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          Registered on {new Date(provider.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Account created</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {provider.documents && provider.documents.length > 0 && (
                <section>
                  <h2 className="mb-6 text-xl font-semibold text-slate-900">Documents</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {provider.documents.map((doc: ProviderDocument, idx: number) => (
                      <div key={idx} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md">
                        {doc.type?.startsWith('image') ? (
                          <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                            <Image
                              src={doc.url}
                              alt={doc.name || 'Document'}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700"
                            >
                              <FileText size={16} />
                              View
                            </a>
                          </div>
                        )}
                        {doc.name && (
                          <div className="border-t border-slate-200 px-4 py-3">
                            <p className="text-center text-xs font-semibold text-slate-900">
                              {doc.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)}>
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-2 inline-flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-1.5">
            <Clock size={16} className="text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {pendingAction === 'APPROVE' && 'Approval'}
              {pendingAction === 'REJECT' && 'Rejection'}
              {pendingAction === 'REQUEST_CHANGES' && 'Request'}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            {pendingAction === 'APPROVE' && 'Approve Provider'}
            {pendingAction === 'REJECT' && 'Reject Provider'}
            {pendingAction === 'REQUEST_CHANGES' && 'Request Changes'}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {pendingAction === 'APPROVE' &&
              'This provider will be marked as verified and can start accepting patients.'}
            {pendingAction === 'REJECT' &&
              'This provider will be rejected. They will need to reapply.'}
            {pendingAction === 'REQUEST_CHANGES' &&
              'The provider will be notified to update their information.'}
          </p>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Notes (optional)
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={4}
              placeholder="Add any additional notes or feedback..."
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="flex-1 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>

            <Button
              onClick={() => handleVerificationAction(pendingAction!)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all ${
                pendingAction === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : pendingAction === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}