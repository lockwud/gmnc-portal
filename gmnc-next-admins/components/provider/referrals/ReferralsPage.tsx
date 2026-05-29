'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ArrowLeftRight,
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  FileText,
  Plus,
  Eye,
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
}

interface Provider {
  id: string;
  profession: string;
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
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
  { value: 'PHYSIOTHERAPIST', label: 'Physiotherapist' },
  { value: 'OCCUPATIONAL_THERAPIST', label: 'Occupational Therapist' },
  { value: 'SPEECH_THERAPIST', label: 'Speech Therapist' },
  { value: 'DIETITIAN', label: 'Dietitian' },
  { value: 'PSYCHOLOGIST', label: 'Psychologist' },
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
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <CheckCircle2 size={12} />,
  },
};

export default function ReferralsPage() {
  const router = useRouter();
  const { token } = useAuth();
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
  
  // Create referral form state
  const [formData, setFormData] = useState<CreateReferralData>({
    patientId: '',
    toProfession: 'PHYSIOTHERAPIST',
    reason: '',
  });
  
  // Options for selects
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

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

      const incomingData = await incomingRes.json();
      const outgoingData = await outgoingRes.json();

      if (incomingData.success) {
        setIncomingReferrals(incomingData.data?.referrals || incomingData.referrals || []);
      }
      if (outgoingData.success) {
        setOutgoingReferrals(outgoingData.data?.referrals || outgoingData.referrals || []);
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
    setIsLoadingPatients(true);
    try {
      const response = await fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const fetchProvidersByProfession = async (profession: string) => {
    setIsLoadingProviders(true);
    try {
      const response = await fetch(`/api/providers?profession=${profession}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setProviders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
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
      const data = await response.json();
      if (data.success) {
        setAssessments(data.data?.assessments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const handleOpenCreateModal = () => {
    fetchPatients();
    setIsCreateModalOpen(true);
  };

  const handlePatientChange = (patientId: string) => {
    setFormData(prev => ({ ...prev, patientId }));
    if (patientId) {
      fetchPatientAssessments(patientId);
    } else {
      setAssessments([]);
    }
  };

  const handleProfessionChange = (profession: string) => {
    setFormData(prev => ({ ...prev, toProfession: profession, toProviderId: undefined }));
    fetchProvidersByProfession(profession);
  };

  const handleCreateReferral = async () => {
    if (!formData.patientId || !formData.toProfession || !formData.reason) {
      show({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
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

      if (data.success) {
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
    });
    setProviders([]);
    setAssessments([]);
  };

  const handleUpdateStatus = async (referralId: string, status: string) => {
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

      if (data.success) {
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
          {activeTab === 'incoming' && referral.status === 'PENDING' && (
            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleUpdateStatus(referral.id, 'ACCEPTED')}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-50 px-3 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle2 size={12} />
                Accept
              </button>
              <button
                onClick={() => handleUpdateStatus(referral.id, 'REJECTED')}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-rose-50 px-3 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
              >
                <XCircle size={12} />
                Reject
              </button>
            </div>
          )}
          {activeTab === 'outgoing' && referral.status === 'PENDING' && (
            <span className="text-[11px] text-amber-600">Waiting for response</span>
          )}
          {referral.status === 'ACCEPTED' && (
            <span className="text-[11px] text-emerald-600">Awaiting task assignment</span>
          )}
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
            {/* Patient Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Patient *</label>
              <select
                value={formData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                disabled={isLoadingPatients}
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Specialty *</label>
              <select
                value={formData.toProfession}
                onChange={(e) => handleProfessionChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                {professionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Provider (Optional) */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Specific Provider (Optional)
              </label>
              <select
                value={formData.toProviderId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, toProviderId: e.target.value || undefined }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                disabled={isLoadingProviders}
              >
                <option value="">Any {formData.toProfession?.replace('_', ' ')}</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.user?.fullName} ({provider.profession?.replace('_', ' ')})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Leave empty to broadcast to all providers of this specialty</p>
            </div>

            {/* Assessment (Optional) */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Related Assessment (Optional)
              </label>
              <select
                value={formData.assessmentId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, assessmentId: e.target.value || undefined }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                disabled={!formData.patientId || isLoadingAssessments}
              >
                <option value="">No assessment</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.toolCode?.replace(/_/g, ' ')} ({formatDate(assessment.assessedAt)})
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Reason for Referral *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                placeholder="Describe the reason for this referral..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none"
              />
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