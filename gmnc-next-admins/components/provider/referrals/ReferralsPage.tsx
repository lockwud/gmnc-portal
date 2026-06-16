'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SmallDropdown from '@/components/ui/SmallDropdown';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ArrowLeftRight,
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
 
}

interface Provider {
  id: string;
  profession: string;
  userType?: string;
  user: {
    fullName: string;
  };
}

interface Assessment {
  id: string;
  toolCode: string;
  status: string;
  assessedAt: string;
}

interface Referral {
  id: string;
  patientId: string;
  fromProviderId: string;
  toProviderId: string | null;
  toProfession: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  fromProvider?: {
    id: string;
    profession: string;
    user: { fullName: string };
  };
  toProvider?: {
    id: string;
    profession: string;
    user: { fullName: string };
  };
  relatedAssessment?: Assessment;
}

interface CreateReferralData {
  patientId: string;
  toProviderId?: string;
  toProfession: string;
  reason: string;
  assessmentId?: string;
}

const professionOptions = [
  { value: 'GENERAL_PAEDIATRICIAN', label: 'General Paediatrician' },
  { value: 'DEVELOPMENTAL_PAEDIATRICIAN', label: 'Developmental Paediatrician' },
  { value: 'PAEDIATRIC_NEUROLOGIST', label: 'Paediatric Neurologist' },
  { value: 'REHABILITATION_PAEDIATRICIAN', label: 'Rehabilitation Paediatrician' },
  { value: 'PHYSIOTHERAPIST', label: 'Physiotherapist' },
  { value: 'OCCUPATIONAL_THERAPIST', label: 'Occupational Therapist' },
  { value: 'SPEECH_THERAPIST', label: 'Speech Therapist' },
  { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
  { value: 'DIETITIAN', label: 'Dietitian' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
];

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: <Clock size={12} />,
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    icon: <XCircle size={12} />,
  },
  DECLINED: {
    label: 'Declined',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    icon: <XCircle size={12} />,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <CheckCircle2 size={12} />,
  },
};

type ReferralActionsDropdownProps = {
  referral: Referral;
  canAccept: boolean;
  canReject: boolean;
  canReassign: boolean;
  onAccept: () => void;
  onReject: () => void;
  onReassign: () => void;
};

function ReferralActionsDropdown({
  referral,
  canAccept,
  canReject,
  canReassign,
  onAccept,
  onReject,
  onReassign,
}: ReferralActionsDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const actions = [
    {
      label: 'Reassign',
      icon: <RotateCcw size={13} />,
      disabled: !canReassign,
      onClick: onReassign,
    },
    {
      label: 'Reject',
      icon: <XCircle size={13} />,
      disabled: !canReject,
      onClick: onReject,
      className: 'hover:text-rose-700',
    },
    {
      label: 'Accept',
      icon: <CheckCircle2 size={13} />,
      disabled: !canAccept,
      onClick: onAccept,
      className: 'hover:text-emerald-700',
    },
  ];

  return (
    <div ref={rootRef} className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Actions for referral ${referral.id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
      >
        <MoreHorizontal size={15} />
      </button>

      {open ? (
        <div className="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              onClick={() => {
                if (action.disabled) return;
                setOpen(false);
                action.onClick();
              }}
              className={`flex h-8 w-full items-center gap-2 px-3 text-[11px] font-medium text-slate-600 transition ${action.className ?? 'hover:text-slate-800'} ${
                action.disabled
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-slate-400">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ReferralsPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { show } = useToast();
  
  const [incomingReferrals, setIncomingReferrals] = useState<Referral[]>([]);
  const [outgoingReferrals, setOutgoingReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Current provider info
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  
  // Create referral form state
  const [formData, setFormData] = useState<CreateReferralData>({
    patientId: '',
    toProfession: 'PHYSIOTHERAPIST',
    reason: '',
    toProviderId: undefined,
    assessmentId: undefined,
  });
  
  // Options for selects
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'patient' | 'profession' | 'provider' | 'assessment' | null>(null);

  useEffect(() => {
      if (token) {
      fetchReferrals();
    }
  }, [token]);

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch('/api/assessment/referrals/incoming', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
        fetch('/api/assessment/referrals/outgoing', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
      ]);

      if (!incomingRes.ok) {
        console.error('Incoming referrals API error:', incomingRes.status);
        setIncomingReferrals([]);
      } else {
        const incomingData = await incomingRes.json();
        if (incomingData.status === "SUCCESS" || incomingData.success) {
          setIncomingReferrals(incomingData.data?.referrals || incomingData.referrals || []);
        }
      }

      if (!outgoingRes.ok) {
        console.error('Outgoing referrals API error:', outgoingRes.status);
        setOutgoingReferrals([]);
      } else {
        const outgoingData = await outgoingRes.json();
        if (outgoingData.status === "SUCCESS" || outgoingData.success) {
          setOutgoingReferrals(outgoingData.data?.referrals || outgoingData.referrals || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
      show({
        title: 'Error',
        message: 'Failed to load referrals. Please try again.',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!token) {
      show({
        title: 'Error',
        message: 'Authentication token is missing',
        type: 'error',
        duration: 4000,
      });
      setIsLoadingPatients(false);
      return;
    }
    setIsLoadingPatients(true);
    try {
      const response = await fetch('/api/patients?limit=200', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Patients API error:', response.status);
        setPatients([]);
        setIsLoadingPatients(false);
        return;
      }
      const data = await response.json();
      const patientList = (data.data?.data || data.data || []) as any[];
      const formatted = patientList.map((p: any) => ({
        id: p.id,
        fullName: p.fullName,
        assessmentCount: 0,
        hasAssessments: true,
      }));
      setPatients(formatted);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      show({
        title: 'Error',
        message: 'Failed to load patients',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const fetchProvidersByProfession = async (profession: string) => {
    if (!token) {
      show({
        title: 'Error',
        message: 'Authentication token is missing',
        type: 'error',
        duration: 4000,
      });
      setIsLoadingProviders(false);
      return;
    }
    setIsLoadingProviders(true);
    try {
      // Get service providers by profession
      const response = await fetch(`/api/service-provider?profession=${encodeURIComponent(profession)}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Providers API error:', response.status);
        setProviders([]);
        setIsLoadingProviders(false);
        return;
      }
      const data = await response.json();
      if (data.status === "SUCCESS" || data.success) {
        const allProviders = data.data?.data || data.data || [];
        // Filter by profession
        let filteredProviders = (Array.isArray(allProviders) ? allProviders : []).filter((p: any) => {
          const providerProfession = p.profession || p.user?.profession;
          return providerProfession === profession;
        });

        // Add current provider to the list if they match the profession (for self-referral)
        if (currentProvider && currentProvider.profession === profession) {
          const isAlreadyInList = filteredProviders.some((p: any) => p.id === currentProvider.id);
          if (!isAlreadyInList) {
            filteredProviders = [
              ...filteredProviders,
              {
                id: currentProvider.id,
                profession: currentProvider.profession,
                user: { fullName: currentProvider.user.fullName },
              },
            ];
          }
        }

        setProviders(filteredProviders);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      show({
        title: 'Error',
        message: 'Failed to load providers',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const fetchPatientAssessments = async (patientId: string) => {
    setIsLoadingAssessments(true);
    try {
      const response = await fetch(`/api/assessment/patient/${patientId}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Assessments API error:', response.status);
        setAssessments([]);
        setIsLoadingAssessments(false);
        return;
      }
      const data = await response.json();
      if (data.status === "SUCCESS" || data.success) {
        setAssessments(data.data?.assessments || data.assessments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
      setAssessments([]);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const handleOpenCreateModal = async () => {
    if (!token) {
      show({
        title: 'Error',
        message: 'Authentication token is missing',
        type: 'error',
        duration: 4000,
      });
      return;
    }
    await Promise.all([
      fetchPatients(),
      fetchCurrentProvider(),
      fetchProvidersByProfession(formData.toProfession),
    ]);
    setIsCreateModalOpen(true);
  };

  const fetchCurrentProvider = async () => {
    if (!token || !user?.id) {
      return;
    }
    try {
      const response = await fetch(`/api/providers?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await response.json();
      if ((data.status === "SUCCESS" || data.success) && Array.isArray(data.data?.data) && data.data.data.length > 0) {
        const providerData = data.data.data[0];
        setCurrentProvider({
          id: providerData.id,
          profession: providerData.profession,
          user: { fullName: providerData.user?.fullName || user.fullName || '' },
        });
      }
    } catch (err) {
      console.error('Failed to fetch current provider:', err);
    }
  };

  const handlePatientChange = (patientId: string) => {
    setFormData(prev => ({ ...prev, patientId }));
    if (patientId) {
      fetchPatientAssessments(patientId);
    } else {
      setAssessments([]);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setFormData(prev => ({ ...prev, toProviderId: providerId || undefined }));
  };

  const handleProfessionChange = (profession: string) => {
    setFormData(prev => ({ ...prev, toProfession: profession, toProviderId: undefined }));
    fetchProvidersByProfession(profession);
  };

  const handleCreateReferral = async () => {
    if (!formData.patientId || !formData.toProfession || !formData.toProviderId || !formData.reason) {
      show({
        title: 'Validation Error',
        message: 'Please fill in all required fields including the provider.',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: formData.patientId,
        toProfession: formData.toProfession,
        reason: formData.reason,
        ...(formData.toProviderId && { toProviderId: formData.toProviderId }),
        ...(formData.assessmentId && { assessmentId: formData.assessmentId }),
      };

      const response = await fetch('/api/assessment/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.status === "SUCCESS" || data.success) {
        show({
          title: 'Success',
          message: 'Referral created successfully.',
          type: 'success',
          duration: 3000,
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchReferrals();
      } else {
        show({
          title: 'Error',
          message: data.message || 'Failed to create referral.',
          type: 'error',
          duration: 4000,
        });
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
      show({
        title: 'Error',
        message: 'Network error. Please try again.',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      toProfession: 'PHYSIOTHERAPIST',
      reason: '',
      toProviderId: undefined,
      assessmentId: undefined,
    });
    setProviders([]);
    setAssessments([]);
    setCurrentProvider(null);
  };

  const handleUpdateStatus = async (referralId: string, status: string) => {
    if (!token) {
      show({
        title: 'Error',
        message: 'Authentication token is missing',
        type: 'error',
        duration: 4000,
      });
      return;
    }
    try {
      const response = await fetch(`/api/assessment/referrals/${referralId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.status === "SUCCESS" || data.success) {
        show({
          title: 'Success',
          message: `Referral ${status.toLowerCase()} successfully.`,
          type: 'success',
          duration: 3000,
        });
        fetchReferrals();
      } else {
        show({
          title: 'Error',
          message: data.message || 'Failed to update referral status.',
          type: 'error',
          duration: 4000,
        });
      }
    } catch (err) {
      console.error('Failed to update referral:', err);
      show({
        title: 'Error',
        message: 'Network error. Please try again.',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleReassignReferral = async (referral: Referral) => {
    if (!token) {
      show({
        title: 'Error',
        message: 'Authentication token is missing',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    const nextProfession = referral.toProfession || 'PHYSIOTHERAPIST';

    setProviders([]);
    setAssessments([]);
    setFormData({
      patientId: referral.patientId,
      toProfession: nextProfession,
      reason: referral.reason || '',
      toProviderId: undefined,
      assessmentId: referral.relatedAssessment?.id,
    });

    await Promise.all([
      fetchPatients(),
      fetchCurrentProvider(),
      referral.patientId ? fetchPatientAssessments(referral.patientId) : Promise.resolve(),
      fetchProvidersByProfession(nextProfession),
    ]);

    setIsCreateModalOpen(true);
  };

  const getCurrentReferrals = () => {
    const referrals = activeTab === 'incoming' ? incomingReferrals : outgoingReferrals;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      data: referrals.slice(startIndex, endIndex),
      total: referrals.length,
    };
  };

  const { data: currentReferrals, total: totalItems } = getCurrentReferrals();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderReferralRow = (referral: Referral) => {
    const status = statusConfig[referral.status] || statusConfig.PENDING;
    const isPending = referral.status === 'PENDING';
    const canAccept = activeTab === 'incoming' && isPending;
    const canReject = isPending;
    const canReassign = activeTab === 'outgoing' && isPending;
    
    return (
      <tr
        key={referral.id}
        className="transition cursor-pointer hover:bg-emerald-50"
        onClick={() => router.push(`/admin/referrals/${referral.id}`)}
      >
        <td className="border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {referral.patient?.fullName || '—'}
            </p>
            <p className="text-[11px] text-slate-500">ID: {referral.patientId?.slice(0, 8)}</p>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
          {activeTab === 'incoming' 
            ? referral.fromProvider?.user?.fullName || '—'
            : referral.toProvider?.user?.fullName || `Any ${referral.toProfession?.replace('_', ' ')}`
          }
        </td>
        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium">
            {referral.toProfession?.replace('_', ' ')}
          </span>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}>
            {status.icon}
            {status.label}
          </span>
        </td>
        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
          {formatDate(referral.createdAt)}
        </td>
        <td className="border-b border-slate-100 px-4 py-3 text-center">
          <ReferralActionsDropdown
            referral={referral}
            canAccept={canAccept}
            canReject={canReject}
            canReassign={canReassign}
            onAccept={() => handleUpdateStatus(referral.id, 'ACCEPTED')}
            onReject={() => handleUpdateStatus(referral.id, 'DECLINED')}
            onReassign={() => handleReassignReferral(referral)}
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Referrals</h1>
          <p className="text-xs text-slate-400">Manage patient referrals between providers</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Plus size={10} strokeWidth={2.5} />
          </span>
          Create Referral
        </Button>
      </div>

      {/* Tabs with colored icons and count badges - Incoming: Blue, Outgoing: Emerald/Green */}
      <div className="border-b border-slate-200 px-4">
        <div className="flex gap-6">
          <button
            onClick={() => { setActiveTab('incoming'); setCurrentPage(1); }}
            className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition ${
              activeTab === 'incoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Inbox size={14} className={activeTab === 'incoming' ? 'text-blue-600' : 'text-blue-500'} />
            Incoming
            {incomingReferrals.length > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                activeTab === 'incoming' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {incomingReferrals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('outgoing'); setCurrentPage(1); }}
            className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition ${
              activeTab === 'outgoing'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send size={14} className={activeTab === 'outgoing' ? 'text-emerald-600' : 'text-emerald-500'} />
            Outgoing
            {outgoingReferrals.length > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                activeTab === 'outgoing' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {outgoingReferrals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
        <div className="flex h-full min-h-0 flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : currentReferrals.length === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white rounded-lg">
              <div className="w-full max-w-md text-center">
                <ArrowLeftRight size={48} className="mx-auto mb-3 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-900">No referrals</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {activeTab === 'incoming' 
                    ? "You don't have any incoming referrals yet."
                    : "You haven't created any referrals yet."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Table Container */}
              <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 rounded-t-lg bg-white">
                <div className="h-full overflow-auto scrollbar-none">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-emerald-600">
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white rounded-tl-lg">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">
                          {activeTab === 'incoming' ? 'From Provider' : 'To Provider'}
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Specialty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Date</th>
                        <th className="px-4 py-3 text-center text-[11px] font-medium text-white rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReferrals.map(renderReferralRow)}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="border border-slate-200 border-t-0 rounded-b-lg bg-white">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Referral Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create Referral</h2>
              <p className="text-sm text-slate-500 mt-0.5">Refer a patient to another provider</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <XCircle size={16} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Patient *</label>
                <SmallDropdown
                  value={formData.patientId}
                  options={patients.map((p) => ({ value: p.id, label: p.fullName }))}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, patientId: value }));
                    fetchPatientAssessments(value);
                  }}
                  placeholder="Select a patient"
                  open={openDropdown === 'patient'}
                  onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'patient' : null)}
                  pageSize={4}
                />
                {isLoadingPatients && (
                  <div className="mt-1 flex items-center text-sm text-slate-400">
                    <div className="h-2 w-2 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2"></div>
                    Loading patients...
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Specialty *</label>
                <SmallDropdown
                  value={formData.toProfession}
                  options={professionOptions}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, toProfession: value, toProviderId: undefined }));
                    fetchProvidersByProfession(value);
                  }}
                  placeholder="Select specialty"
                  open={openDropdown === 'profession'}
                  onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'profession' : null)}
                  pageSize={5}
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Refer To *
                </label>
                <SmallDropdown
                  value={formData.toProviderId || ''}
                  options={providers.map((p) => ({
                    value: p.id,
                    label: `${p.user?.fullName} (${p.profession?.replace('_', ' ')})`,
                  }))}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, toProviderId: value }));
                  }}
                  placeholder="Select provider"
                  open={openDropdown === 'provider'}
                  onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'provider' : null)}
                  pageSize={4}
                />
                {isLoadingProviders && (
                  <div className="mt-1 flex items-center text-sm text-slate-400">
                    <div className="h-2 w-2 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2"></div>
                    Loading providers...
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1">Select a specific provider to refer this patient to</p>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Related Assessment (Optional)
                </label>
                <SmallDropdown
                  value={formData.assessmentId || ''}
                  options={assessments.map((a) => ({
                    value: a.id,
                    label: `${a.toolCode?.replace(/_/g, ' ')} (${formatDate(a.assessedAt)})`,
                  }))}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, assessmentId: value || undefined }));
                  }}
                  placeholder="No assessment"
                  open={openDropdown === 'assessment'}
                  onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'assessment' : null)}
                  pageSize={4}
                />
                {!formData.patientId && (
                  <p className="text-[11px] text-amber-500 mt-1">Select a patient first to load assessments</p>
                )}
                {isLoadingAssessments && (
                  <div className="mt-1 flex items-center text-sm text-slate-400">
                    <div className="h-2 w-2 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2"></div>
                    Loading assessments...
                  </div>
                )}
                {formData.patientId && !isLoadingAssessments && assessments.length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">No assessments found for this patient</p>
                )}
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Reason for Referral *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  placeholder="Describe the reason for this referral..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <Button
              onClick={handleCreateReferral}
              disabled={isSubmitting || !formData.patientId || !formData.reason}
              className="h-10 rounded-full bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Referral'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
