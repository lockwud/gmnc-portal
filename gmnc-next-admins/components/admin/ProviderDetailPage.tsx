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
  ChevronLeft,
  Clock3,
  ShieldCheck,
  AlertCircle,
  User,
  Award,
  FileText,
  Briefcase,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

import {
  getProviderById,
  verifyProvider,
  ProviderVerificationAction,
} from '@/lib/api/providers';

interface ProviderData {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseImage: string;
  licenseExpiry: string;
  licenseIssuedBy: string;
  licenseIssuedDate: string;
  licenseStatus: string;
  facilityType: string;
  facilityName: string;
  facilityAddress: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
  profession: string;
  licenseType: string;
  licensePin: string;
  verificationStatus: string;
  verifiedAt: string;
  verifiedBy: string;
  verifiedByName?: string;
  documents?: Array<{
    url?: string;
    name?: string;
    type?: string;
  }>;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
    profileCompleted: boolean;
    verified: boolean;
    gender: string;
    dateOfBirth: string;
    accountStatus: string;
    userType: string;
    profileImage?: string;
  };
}

export default function ProviderDetailPage({
  providerId,
}: {
  providerId: string;
}) {
  const router = useRouter();
  const { token, user } = useAuth();

  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<ProviderVerificationAction | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      setIsLoading(true);
      try {
        const data = await getProviderById(providerId, token ?? undefined);
        setProvider(data as unknown as ProviderData);
      } catch (error) {
        console.error('Failed to load provider:', error);
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

  const handleVerificationAction = async (
    action: ProviderVerificationAction
  ) => {
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
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const formatDateToWords = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFirstInitial = (name: string) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const getStatusBadge = () => {
    switch (provider?.verificationStatus) {
      case 'VERIFIED':
        return {
          label: 'Verified',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          icon: <ShieldCheck size={14} />,
        };
      case 'PENDING_REVIEW':
        return {
          label: 'Pending Review',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          icon: <Clock3 size={14} />,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          icon: <AlertCircle size={14} />,
        };
      case 'SUSPENDED':
        return {
          label: 'Suspended',
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          icon: <AlertCircle size={14} />,
        };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[5px] border-emerald-200 border-t-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Loading provider details...
            </p>
            <p className="mt-1 text-xs text-slate-500">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white px-10 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">
            Provider not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Unable to load provider information.
          </p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();

  // Construct authenticated image URL
  const getAuthenticatedImageUrl = (url: string) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${token}`;
  };

  const verificationDocuments = [
    ...(provider.licenseImage
      ? [{
          name: 'Professional license image',
          type: provider.licenseType || 'License',
          url: provider.licenseImage,
        }]
      : []),
    ...(provider.documents ?? []).filter((document) => document.url),
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
        <button
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          aria-label="Go back"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Scrollable Content - Increased bottom padding to ensure all content is visible */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-12">
        <div className="p-6">
          {/* Full Width Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header - With Profile Picture */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-[#f8fbff] via-white to-[#eef5ff] px-6 py-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Small Rounded Profile Circle - Uncolored, just border */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-slate-600">
                        {getFirstInitial(provider.user?.fullName || 'U')}
                      </span>
                    </div>
                    {provider.verificationStatus === 'VERIFIED' && (
                      <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                        <CheckCircle2 size={8} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {provider.user?.fullName?.trim() || '—'}
                    </h2>
                    {statusBadge && (
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-2.5 py-0.5 mt-0.5`}
                      >
                        {statusBadge.icon}
                        <span className={`text-[10px] font-medium ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {provider.verificationStatus !== 'VERIFIED' && (
                    <Button
                      onClick={() => openActionModal('APPROVE')}
                      className="h-8 rounded-full bg-emerald-600 px-3 text-[10px] font-medium text-white hover:bg-emerald-700"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        Approve
                      </div>
                    </Button>
                  )}
                  {provider.verificationStatus === 'PENDING_REVIEW' && (
                    <Button
                      onClick={() => openActionModal('REQUEST_CHANGES')}
                      className="h-8 rounded-full border border-amber-200 bg-amber-50 px-3 text-[10px] font-medium text-amber-700 hover:bg-amber-100"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        Request changes
                      </div>
                    </Button>
                  )}
                  {provider.verificationStatus !== 'REJECTED' && (
                    <Button
                      onClick={() => openActionModal('REJECT')}
                      className="h-8 rounded-full border border-rose-200 bg-rose-50 px-3 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
                    >
                      <div className="flex items-center gap-1.5">
                        <XCircle size={12} />
                        Reject
                      </div>
                    </Button>
                  )}
                  {provider.verificationStatus !== 'SUSPENDED' && (
                    <Button
                      onClick={() => openActionModal('SUSPEND')}
                      className="h-8 rounded-full border border-orange-200 bg-orange-50 px-3 text-[10px] font-medium text-orange-700 hover:bg-orange-100"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        Suspend
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Column 1: Personal Information - Blue Icon */}
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> Personal Information
                  </h3>
                  <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] text-slate-500">Date of Birth</p>
                        <p className="text-sm font-medium text-slate-800">
                          {formatDateToWords(provider.user?.dateOfBirth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Gender</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.user?.gender || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-800 break-all">
                          {provider.user?.email || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Contact</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.user?.phoneNumber || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Employment & Professional - Purple Icon */}
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-purple-600" /> Employment / Professional
                  </h3>
                  <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] text-slate-500">Job Title</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.profession || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Staff Number</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.licenseNumber || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Specialty</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.licenseType || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Experience</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.experience ? `${provider.experience} years` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Facility Name</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.facilityName || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Facility Type</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.facilityType?.replace(/_/g, ' ') || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Facility Address</p>
                        <p className="text-sm font-medium text-slate-800">
                          {provider.facilityAddress || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional License Card - Purple Icon */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Award size={14} className="text-purple-600" /> Professional License
                  </h3>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    {provider.licenseImage && !imageError ? (
                      <>
                        <div className="relative h-44 w-full bg-gradient-to-br from-slate-50 to-white">
                          <Image
                            src={getAuthenticatedImageUrl(provider.licenseImage)}
                            alt="Professional License"
                            fill
                            className="object-contain"
                            onError={() => setImageError(true)}
                            unoptimized
                          />
                        </div>
                        <div className="p-3.5 bg-gradient-to-br from-slate-50/90 to-white border-t border-slate-100">
                          <p className="text-[11px] text-slate-600">
                            License Number:{' '}
                            <span className="font-mono font-semibold">
                              {provider.licenseNumber || 'N/A'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Issued By: {provider.licenseIssuedBy || 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Issued Date: {formatDateToWords(provider.licenseIssuedDate)}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Status:{' '}
                            <span
                              className={`font-medium ${
                                provider.licenseStatus === 'ACTIVE'
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {provider.licenseStatus || 'N/A'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Expiry Date:{' '}
                            <span
                              className={
                                new Date(provider.licenseExpiry) < new Date()
                                  ? 'text-rose-600 font-medium'
                                  : 'text-slate-800'
                              }
                            >
                              {formatDateToWords(provider.licenseExpiry)}
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-white">
                        <ImageIcon size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">License image not available</p>
                        {provider.licenseNumber && (
                          <div className="mt-4 text-left border-t border-slate-100 pt-4">
                            <p className="text-[11px] text-slate-600">
                              License Number:{' '}
                              <span className="font-mono font-semibold">
                                {provider.licenseNumber || 'N/A'}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Issued By: {provider.licenseIssuedBy || 'N/A'}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Issued Date: {formatDateToWords(provider.licenseIssuedDate)}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Status:{' '}
                              <span
                                className={`font-medium ${
                                  provider.licenseStatus === 'ACTIVE'
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {provider.licenseStatus || 'N/A'}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Expiry Date:{' '}
                              <span
                                className={
                                  new Date(provider.licenseExpiry) < new Date()
                                    ? 'text-rose-600 font-medium'
                                    : 'text-slate-800'
                                }
                              >
                                {formatDateToWords(provider.licenseExpiry)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: Documents & Employment History */}
              <div className="p-5 space-y-5">
                {/* Verification Documents - Yellow Dark Icon */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-amber-600" /> Verification Documents
                  </h3>
                  <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 shadow-sm">
                    {verificationDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {verificationDocuments.map((document, index) => {
                          const documentUrl = document.url ? getAuthenticatedImageUrl(document.url) : '';
                          const isImage = /\.(png|jpe?g|webp|gif)$/i.test(document.url ?? '') || index === 0;

                          return (
                            <div key={`${document.url}-${index}`} className="overflow-hidden rounded-xl border border-amber-100 bg-white shadow-sm">
                              {isImage && documentUrl ? (
                                <div className="relative h-36 w-full bg-slate-50">
                                  <Image
                                    src={documentUrl}
                                    alt={document.name || 'Verification document'}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              ) : null}
                              <div className="flex items-start justify-between gap-3 border-t border-amber-50 p-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <FileCheck size={14} className="shrink-0 text-amber-600" />
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {document.name || `Verification document ${index + 1}`}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {document.type || 'Uploaded document'}
                                  </p>
                                </div>
                                {documentUrl ? (
                                  <a
                                    href={documentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                                  >
                                    View <ExternalLink size={12} />
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <FileCheck size={36} className="text-amber-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No verification document found in the provider record.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employment History Card with Backdrop */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-500" /> Employment History
                  </h3>
                  <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-800">
                      {provider.facilityName || 'Current Facility'}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {provider.profession || 'Provider'} | 2022 - Present
                    </p>
                  </div>
                </div>

                {/* Verification Info - Green Icon with Backdrop */}
                {provider.verifiedAt && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-600" /> Verification Info
                    </h3>
                    <div className="bg-gradient-to-br from-emerald-50/40 to-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                      <p className="text-[11px] text-slate-600">
                        Verified On: {formatDateTime(provider.verifiedAt)}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Verified By: {provider.verifiedByName || user?.fullName || 'System Administrator'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)}>
        <div className="w-full max-w-xl rounded-[28px] bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {pendingAction === 'APPROVE' && 'Approve Provider'}
            {pendingAction === 'REJECT' && 'Reject Provider'}
            {pendingAction === 'REQUEST_CHANGES' && 'Request Changes'}
            {pendingAction === 'SUSPEND' && 'Suspend Provider'}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {pendingAction === 'APPROVE' &&
              'This provider will become publicly active and verified.'}
            {pendingAction === 'REJECT' &&
              'This action will reject the provider application.'}
            {pendingAction === 'REQUEST_CHANGES' &&
              'The provider will remain pending while they address the requested changes.'}
            {pendingAction === 'SUSPEND' &&
              'This action will suspend the provider verification until an administrator reviews it again.'}
          </p>
          <div className="mt-5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Administrative Notes
            </label>
            <textarea
              rows={4}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add notes or feedback..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="h-9 rounded-full border border-slate-200 px-4 text-[11px] font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <Button
              onClick={() => handleVerificationAction(pendingAction!)}
              className={`h-9 rounded-full px-5 text-[11px] font-medium text-white transition-all ${
                pendingAction === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : pendingAction === 'REQUEST_CHANGES'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : pendingAction === 'SUSPEND'
                      ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
