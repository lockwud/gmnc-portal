'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SmallDropdown from '@/components/ui/SmallDropdown';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Video,
  ListChecks,
  CalendarDays,
  Eye,
  Loader2,
  Play,
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
}

interface Referral {
  id: string;
  patientId: string;
  patient?: Patient;
  fromProviderId: string;
  toProviderId: string;
  toProfession: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface RehabTask {
  id: string;
  patientId: string;
  providerId: string;
  referralId: string;
  title: string;
  instructions: string;
  instructionSteps: string[] | null;
  frequencyPerDay: number | null;
  frequencyNote: string | null;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
  videoUrl: string | null;
  progress: number;
  status: 'ASSIGNED' | 'COMPLETED' | 'PENDING';
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  referral?: Referral;
}

type TaskStatusFilter = 'ALL' | 'ASSIGNED' | 'COMPLETED';
type WizardStep = 1 | 2 | 3;

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: <CheckCircle2 size={12} className="text-emerald-600" />,
  },
  ASSIGNED: {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <ClockIcon size={12} className="text-blue-600" />,
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: <AlertCircle size={12} className="text-amber-600" />,
  },
};

export default function TasksPage() {
   const router = useRouter();
   const { token, isLoading: authIsLoading } = useAuth();
   const { show } = useToast();

  const [tasks, setTasks] = useState<RehabTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RehabTask | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('ALL');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    referralId: '',
    title: '',
    instructions: '',
    instructionSteps: [] as string[],
    frequencyPerDay: 1,
    frequencyNote: '',
    durationDays: 7,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    videoUrl: '',
  });
  const [instructionStepInput, setInstructionStepInput] = useState('');

  // Options for selects
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [acceptedReferrals, setAcceptedReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [videos, setVideos] = useState<{ id: string; title: string; videoUrl: string }[]>([]);
  const [videoDropdownOpen, setVideoDropdownOpen] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

   useEffect(() => {
      // Wait for auth to finish loading before checking token
      if (!authIsLoading) {
        fetchTasks();
        fetchPatients();
        fetchAcceptedReferrals();
        fetchVideos();
      }
    }, [authIsLoading]);

const fetchTasks = async () => {
     if (!token) {
       show({
         title: 'Error',
         message: 'Authentication token is missing',
         type: 'error',
         duration: 4000,
       });
       setIsLoading(false);
       return;
     }
     setIsLoading(true);
     try {
       const response = await fetch('/api/assessment/tasks/my', {
         headers: { Authorization: `Bearer ${token}` },
         credentials: 'include',
       });
       const data = await response.json();

       if (data.status === "SUCCESS" || data.success) {
         setTasks(data.data?.tasks || data.tasks || []);
       } else {
         show({
           title: 'Error',
           message: data.message || 'Failed to load tasks',
           type: 'error',
           duration: 4000,
         });
       }
     } catch (err) {
       console.error('Failed to fetch tasks:', err);
       show({
         title: 'Error',
         message: 'Network error. Please try again.',
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
       const response = await fetch('/api/patients?limit=100', {
         headers: { Authorization: `Bearer ${token}` },
         credentials: 'include',
       });
        const data = await response.json();
        if (data.status === "SUCCESS" || data.status === true || data.success) {
          const patientList = data.data?.data || data.data || [];
          setPatients(Array.isArray(patientList) ? patientList : []);
        }
     } catch (err) {
       console.error('Failed to fetch patients:', err);
     } finally {
       setIsLoadingPatients(false);
     }
   };

    const fetchAcceptedReferrals = async () => {
      if (!token) {
        show({
          title: 'Error',
          message: 'Authentication token is missing',
          type: 'error',
          duration: 4000,
        });
        setIsLoadingReferrals(false);
        return;
      }
      setIsLoadingReferrals(true);
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

        const [incomingData, outgoingData] = await Promise.all([
          incomingRes.json(),
          outgoingRes.json(),
        ]);

        const incomingList = (incomingData.data?.referrals || incomingData.referrals || []) as Referral[];
        const outgoingList = (outgoingData.data?.referrals || outgoingData.referrals || []) as Referral[];
        const merged = [...incomingList, ...outgoingList];
        const accepted = merged.filter((r) => r.status === 'ACCEPTED');
        const byId = new Map<string, Referral>();
        accepted.forEach((r) => {
          if (!byId.has(r.id)) {
            byId.set(r.id, r);
          }
        });
        setAcceptedReferrals(Array.from(byId.values()));
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
      } finally {
        setIsLoadingReferrals(false);
      }
    };

  const fetchVideos = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/user/videos?pageSize=50&order=date`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      const videosWrapper = data?.data?.videos?.videos ?? data?.data?.videos ?? data?.videos ?? [];
      const list = Array.isArray(videosWrapper) ? videosWrapper : [];
      setVideos(list.map((v: Record<string, string>) => ({ id: v.videoId || v.id || '', title: v.title || '', videoUrl: v.videoUrl || v.url || '' })));
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setFormData({
      patientId: '',
      referralId: '',
      title: '',
      instructions: '',
      instructionSteps: [],
      frequencyPerDay: 1,
      frequencyNote: '',
      durationDays: 7,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      videoUrl: '',
    });
    setInstructionStepInput('');
  };

  const handleOpenCreateModal = () => {
    resetWizard();
    setIsCreateModalOpen(true);
  };

  const handleViewTask = (task: RehabTask) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const handleAddInstructionStep = () => {
    if (instructionStepInput.trim()) {
      setFormData(prev => ({
        ...prev,
        instructionSteps: [...prev.instructionSteps, instructionStepInput.trim()]
      }));
      setInstructionStepInput('');
    }
  };

  const handleRemoveInstructionStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructionSteps: prev.instructionSteps.filter((_, i) => i !== index)
    }));
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && (!formData.patientId || !formData.title || !formData.instructions)) {
      show({
        title: 'Validation Error',
        message: 'Please select a patient and enter task title and instructions.',
        type: 'error',
        duration: 3000,
      });
      return;
    }
    if (wizardStep < 3) {
      setWizardStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleCreateTask = async () => {
     if (!token) {
       show({
         title: 'Error',
         message: 'Authentication token is missing',
         type: 'error',
         duration: 4000,
       });
       return;
     }
     setIsSubmitting(true);
     try {
       const response = await fetch(`/api/assessment/referrals/${formData.referralId}/tasks`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
          body: JSON.stringify({
            title: formData.title,
            instructions: formData.instructions,
            ...(formData.instructionSteps.length > 0 ? { instructionSteps: formData.instructionSteps } : {}),
            frequencyPerDay: formData.frequencyPerDay,
            ...(formData.frequencyNote ? { frequencyNote: formData.frequencyNote } : {}),
            durationDays: formData.durationDays,
            startDate: formData.startDate,
            endDate: formData.endDate,
            ...(formData.videoUrl ? { videoUrl: formData.videoUrl } : {}),
          }),
         credentials: 'include',
       });

      const data = await response.json();

        if (data.status === "SUCCESS" || data.success) {
          show({
            title: 'Success',
            message: 'Rehab task assigned successfully.',
            type: 'success',
            duration: 3000,
          });
          setIsCreateModalOpen(false);
          resetWizard();
          fetchTasks();
        } else {
          show({
            title: 'Error',
            message: data.message || 'Failed to assign task.',
            type: 'error',
            duration: 3000,
          });
        }
      } catch (err) {
        console.error('Failed to create task:', err);
        show({
          title: 'Error',
          message: 'Network error. Please try again.',
          type: 'error',
         duration: 3000,
       });
     } finally {
       setIsSubmitting(false);
     }
   };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'ALL') return true;
    return task.status === statusFilter;
  });

  const getPaginatedTasks = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTasks.slice(startIndex, endIndex);
  };

  const paginatedTasks = getPaginatedTasks();
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const totalItems = filteredTasks.length;

  // Counts for filters
  const allTasksCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'ASSIGNED').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const renderTaskRow = (task: RehabTask) => {
    const status = statusConfig[task.status] || statusConfig.PENDING;
    const progressColor = calculateProgressColor(task.progress);

    return (
      <tr
        key={task.id}
        className="transition cursor-pointer hover:bg-emerald-50"
        onClick={() => handleViewTask(task)}
      >
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <p className="text-sm font-semibold text-slate-900">
              {task.patient?.fullName || '—'}
            </p>
            <p className="text-[11px] text-slate-500">ID: {task.patientId?.slice(0, 8)}</p>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <p className="text-sm font-medium text-slate-800">{task.title}</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{task.instructions}</p>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-slate-400" />
              <span className="text-sm text-slate-600">{task.durationDays} days</span>
            </div>
            {task.frequencyPerDay && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={10} className="text-slate-400" />
                <span className="text-[11px] text-slate-600">{task.frequencyPerDay}x/day</span>
              </div>
            )}
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${task.progress}%` }} />
              </div>
              <span className="text-xs font-medium text-slate-700">{task.progress}%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {task.completedDates?.length || 0}/{task.durationDays} days done
            </p>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3">
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2">
            <span className="text-sm text-slate-600">{formatDate(task.createdAt)}</span>
          </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewTask(task);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          >
            <Eye size={12} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Rehab Tasks</h1>
          <p className="text-xs text-slate-400">Manage patient rehabilitation tasks and track progress</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Plus size={10} strokeWidth={2.5} />
          </span>
          Create Task
        </Button>
      </div>

      {/* Filters with colored icons and backdrop cards */}
      <div className="border-b border-slate-200 px-4 py-2">
        <div className="flex gap-3">
          <button
            onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === 'ALL'
                ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            <ClipboardList size={14} className={statusFilter === 'ALL' ? 'text-purple-600' : 'text-slate-400'} />
            All Tasks
            {allTasksCount > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                statusFilter === 'ALL' ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {allTasksCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setStatusFilter('ASSIGNED'); setCurrentPage(1); }}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === 'ASSIGNED'
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            <ClockIcon size={14} className={statusFilter === 'ASSIGNED' ? 'text-amber-600' : 'text-slate-400'} />
            In Progress
            {inProgressCount > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                statusFilter === 'ASSIGNED' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {inProgressCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setStatusFilter('COMPLETED'); setCurrentPage(1); }}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            <CheckCircle2 size={14} className={statusFilter === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400'} />
            Completed
            {completedCount > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                statusFilter === 'COMPLETED' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {completedCount}
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
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white rounded-lg">
              <div className="w-full max-w-md text-center">
                <ClipboardList size={48} className="mx-auto mb-3 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-900">No tasks found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {statusFilter !== 'ALL' 
                    ? `No ${statusFilter === 'ASSIGNED' ? 'in progress' : 'completed'} tasks available.`
                    : "You haven't assigned any rehab tasks yet."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Table Container */}
              <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 rounded-t-lg bg-white">
                <div className="h-full overflow-auto scrollbar-none">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-emerald-600">
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white rounded-tl-lg">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Task Title</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Schedule</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Progress</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-white">Created</th>
                        <th className="px-4 py-3 text-center text-[11px] font-medium text-white rounded-tr-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTasks.map(renderTaskRow)}
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

      {/* Create Task Modal - Multi-step Wizard */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create Rehab Task</h2>
              <p className="text-sm text-slate-500 mt-0.5">Assign a new rehabilitation task to a patient</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <XCircle size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-1.5 flex-1 rounded-full transition ${
                    step <= wizardStep ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
                {step < 3 && <div className="w-1" />}
              </div>
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Select Patient *</label>
                <SmallDropdown
                  value={formData.patientId as string}
                  options={patients.map((p) => ({ value: p.id, label: p.fullName }))}
                  onChange={(patientId) => {
                    setFormData((prev) => ({ ...prev, patientId }));
                    const referral = acceptedReferrals.find((r) => r.patientId === patientId);
                    if (referral) {
                      setFormData((prev) => ({ ...prev, referralId: referral.id }));
                    }
                  }}
                  placeholder="Select patient"
                  open={patientDropdownOpen}
                  onOpenChange={setPatientDropdownOpen}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Task Title *</label>
                <Input
                  placeholder="e.g., Upper Body Strengthening Exercises"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Instructions *</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                  placeholder="Describe the exercises and how to perform them..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Frequency (per day)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.frequencyPerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequencyPerDay: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={formData.durationDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 7;
                      setFormData(prev => ({
                        ...prev,
                        durationDays: days,
                        endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Frequency Note (Optional)</label>
                <Input
                  placeholder="e.g., Morning and evening, before meals"
                  value={formData.frequencyNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequencyNote: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Step-by-Step Instructions (Optional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={instructionStepInput}
                    onChange={(e) => setInstructionStepInput(e.target.value)}
                    placeholder="Add a step, e.g., Lie on your back"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInstructionStep()}
                  />
                  <button
                    type="button"
                    onClick={handleAddInstructionStep}
                    className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100"
                  >
                    Add
                  </button>
                </div>
                {formData.instructionSteps.length > 0 && (
                  <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                    {formData.instructionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">{idx + 1}</span>
                        <span className="flex-1">{step}</span>
                        <button
                          onClick={() => handleRemoveInstructionStep(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Instruction Video (Optional)</label>
                <SmallDropdown
                  value={formData.videoUrl || ''}
                  options={Array.isArray(videos) ? videos.map((v) => ({ value: v.id, label: v.title })) : []}
                  onChange={(videoId) => {
                    const video = videos.find((v) => v.id === videoId);
                    setFormData((prev) => ({ ...prev, videoUrl: video?.videoUrl || '' }));
                  }}
                  placeholder="Select a video..."
                  open={videoDropdownOpen}
                  onOpenChange={setVideoDropdownOpen}
                />
                {formData.videoUrl && (
                  <a
                    href={formData.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    <Play size={12} />
                    Open selected video
                  </a>
                )}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-5 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Task Preview</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Patient:</span>
                    <span className="text-sm font-medium text-slate-800">{patients.find(p => p.id === formData.patientId)?.fullName || '—'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Task Title:</span>
                    <span className="text-sm font-medium text-slate-800">{formData.title || '—'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Instructions:</span>
                    <span className="text-sm text-slate-600">{formData.instructions || '—'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Frequency:</span>
                    <span className="text-sm text-slate-600">{formData.frequencyPerDay}x per day</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Duration:</span>
                    <span className="text-sm text-slate-600">{formData.durationDays} days</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-xs text-slate-500">Date Range:</span>
                    <span className="text-sm text-slate-600">{formData.startDate} to {formData.endDate}</span>
                  </div>
                  {formData.instructionSteps.length > 0 && (
                    <div className="flex">
                      <span className="w-28 text-xs text-slate-500">Steps:</span>
                      <span className="text-sm text-slate-600">{formData.instructionSteps.length} steps</span>
                    </div>
                  )}
                  {formData.videoUrl && (
                    <div className="flex">
                      <span className="w-28 text-xs text-slate-500">Video:</span>
                      <span className="text-sm text-emerald-600 truncate">{formData.videoUrl}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50/80 to-white rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Once assigned, the patient will be able to view this task on their mobile app.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={wizardStep === 1 ? () => setIsCreateModalOpen(false) : handlePrevStep}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {wizardStep === 1 ? 'Cancel' : 'Back'}
            </button>
            {wizardStep < 3 ? (
              <Button
                onClick={handleNextStep}
                className="h-10 rounded-full bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreateTask}
                disabled={isSubmitting}
                className="h-10 rounded-full bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Assign Task
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* View Task Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6">
          {selectedTask && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ClipboardList size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedTask.title}</h2>
                    <p className="text-sm text-slate-500">{selectedTask.patient?.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <XCircle size={14} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Progress */}
                <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-emerald-600">{selectedTask.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${calculateProgressColor(selectedTask.progress)}`}
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>Completed: {selectedTask.completedDates?.length || 0} days</span>
                    <span>Total: {selectedTask.durationDays} days</span>
                  </div>
                </div>

                 {/* Instructions */}
                 <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                   <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                     <FileText size={14} className="text-blue-500" />
                     Instructions
                   </h3>
                   <div className="text-sm text-slate-600 max-h-32 overflow-y-auto whitespace-pre-line leading-relaxed">
                     {selectedTask.instructions}
                   </div>
                 </div>

                 {/* Step-by-Step Instructions */}
                 {selectedTask.instructionSteps && selectedTask.instructionSteps.length > 0 && (
                   <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                     <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                       <ListChecks size={14} className="text-purple-500" />
                       Step-by-Step Instructions
                     </h3>
                     <div className="max-h-40 overflow-y-auto space-y-2">
                       {selectedTask.instructionSteps.map((step, idx) => (
                         <div key={idx} className="flex items-start gap-2">
                           <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 mt-0.5 flex-shrink-0">{idx + 1}</span>
                           <span className="text-sm text-slate-600 leading-relaxed">{step}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                {/* Task Details Grid */}
                <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-500">Duration</p>
                        <p className="text-sm font-medium text-slate-700">{selectedTask.durationDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-500">Frequency</p>
                        <p className="text-sm font-medium text-slate-700">{selectedTask.frequencyPerDay}x per day</p>
                      </div>
                    </div>
                    {selectedTask.frequencyNote && (
                      <div className="col-span-2 flex items-start gap-2">
                        <AlertCircle size={14} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-500">Note</p>
                          <p className="text-sm text-slate-600">{selectedTask.frequencyNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video */}
                {selectedTask.videoUrl && (
                  <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <Video size={14} className="text-rose-500" />
                      Instruction Video
                    </h3>
                    <a
                      href={selectedTask.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Play size={14} />
                      Watch Video
                    </a>
                  </div>
                )}

                {/* Status */}
                <div className="bg-gradient-to-br from-slate-50/90 to-white rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[selectedTask.status]?.bg} ${statusConfig[selectedTask.status]?.text}`}>
                      {statusConfig[selectedTask.status]?.icon}
                      {statusConfig[selectedTask.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Created</span>
                    <span className="text-xs text-slate-600">{formatDate(selectedTask.createdAt)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}