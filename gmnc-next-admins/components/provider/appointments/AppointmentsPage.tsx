'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  Plus,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { Appointment } from './types';
import { getAppointments, createAppointment } from '@/lib/api/appointments';




const PROVIDER_COLUMNS = [
  'GENERAL_PAEDIATRICIAN',
  'DEVELOPMENTAL_PAEDIATRICIAN',
  'PAEDIATRIC_NEUROLOGIST',
  'NEURODEVELOPMENTAL_PAEDIATRICIAN',
  'REHABILITATION_PAEDIATRICIAN',
  'PHYSIOTHERAPIST',
  'OCCUPATIONAL_THERAPIST',
  'SPEECH_THERAPIST',
  'CLINICAL_PSYCHOLOGIST',
  'DIETITIAN',
] as const;

const PROVIDER_COLUMN_META: Record<
  (typeof PROVIDER_COLUMNS)[number],
  { label: string; color: string; border: string; accent: string }
> = {
  GENERAL_PAEDIATRICIAN: { label: 'General Paediatrician', color: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-500' },
  DEVELOPMENTAL_PAEDIATRICIAN: { label: 'Developmental Paediatrician', color: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500' },
  PAEDIATRIC_NEUROLOGIST: { label: 'Paediatric Neurologist', color: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500' },
  NEURODEVELOPMENTAL_PAEDIATRICIAN: { label: 'Neurodevelopmental Paediatrician', color: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-500' },
  REHABILITATION_PAEDIATRICIAN: { label: 'Rehabilitation Paediatrician', color: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-500' },
  PHYSIOTHERAPIST: { label: 'Physiotherapist', color: 'bg-green-50', border: 'border-green-200', accent: 'bg-green-500' },
  OCCUPATIONAL_THERAPIST: { label: 'Occupational Therapist', color: 'bg-yellow-50', border: 'border-yellow-200', accent: 'bg-yellow-500' },
  SPEECH_THERAPIST: { label: 'Speech Therapist', color: 'bg-cyan-50', border: 'border-cyan-200', accent: 'bg-cyan-500' },
  CLINICAL_PSYCHOLOGIST: { label: 'Clinical Psychologist', color: 'bg-fuchsia-50', border: 'border-fuchsia-200', accent: 'bg-fuchsia-500' },
  DIETITIAN: { label: 'Dietitian', color: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-500' },
};

function formatAppointmentDate(value: Appointment['appointmentDate']) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatAppointmentTime(value: Appointment['appointmentDate']) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getProfessionLabel(profession: string) {
  return (
    PROVIDER_COLUMN_META[profession as (typeof PROVIDER_COLUMNS)[number]]
      ?.label ?? profession.replaceAll('_', ' ').toLowerCase()
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="group rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_8px_18px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-400">
            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            at {formatAppointmentTime(appointment.appointmentDate)}
          </p>
          <h3 className="mt-2 truncate text-[13px] font-bold text-slate-950">
            {appointment.patient.fullName}
          </h3>
        </div>

        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getStatusClass(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="text-[12px] font-bold text-slate-900">
          {appointment.reasonText || 'Appointment'}
        </p>
        <p className="truncate text-[11px] font-semibold text-slate-700">
          {appointment.provider.user.fullName}
        </p>
        <p className="truncate text-[10px] text-slate-400">
          {getProfessionLabel(appointment.provider.profession)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
          {[appointment.patient.fullName, appointment.provider.user.fullName, appointment.provider.facilityName]
            .map((name, index) => (
              <span
                key={`${appointment.id}-${name}`}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-sm ${
                  index === 0
                    ? 'bg-red-50 text-red-500 ring-1 ring-red-100'
                    : index === 1
                      ? 'bg-blue-50 text-blue-500 ring-1 ring-blue-100'
                      : 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100'
                } ${index > 0 ? '-ml-2' : ''}`}
              >
                {getInitials(name)}
              </span>
            ))}
          <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-bold text-slate-600 shadow-sm">
            +1
          </span>
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate text-[10px] font-semibold text-slate-700">
            {formatAppointmentDate(appointment.appointmentDate)}
          </p>
          <p className="truncate text-[10px] text-slate-400">
            {appointment.provider.facilityName}
          </p>
        </div>
      </div>
    </article>
  );
}

function SmallDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  open,
  onOpenChange,
  pageSize = 4,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  placeholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSize?: number;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false);
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onOpenChange, open]);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOptions = filteredOptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          if (nextOpen) {
            setSearch('');
            setPage(1);
          }
          onOpenChange(nextOpen);
        }}
        className="flex h-10 w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300"
      >
        <span className={selected ? 'truncate' : 'truncate text-slate-400'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="mb-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="max-h-52 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-slate-500">No results found.</div>
            ) : (
              paginatedOptions.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      onOpenChange(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-2 flex items-center justify-between px-2 py-1">
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for X icon (since we don't have it imported)
function X({ size = 16, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Simplified modal for creating appointments (similar to user registration modal)
function CreateAppointmentModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [openDropdown, setOpenDropdown] = useState<'patient' | 'provider' | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    providerId: '',
    appointmentDate: '',
    appointmentTime: '',
    reasonText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string; fullName: string; profession: string; facilityName: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const loadMetadata = async () => {
      try {
        // Load Patients list from our unified patients route
        const patientsRes = await fetch('/api/patients');
        const patientsJson = await patientsRes.json();
        if (patientsJson.success && Array.isArray(patientsJson.data)) {
          const mapped = patientsJson.data.map((p: any) => ({
            id: p.id || p.slug || p._id || '',
            fullName: p.fullName || 'Unknown Patient',
          }));
          setPatients(mapped);
        }

        // Load available providers using the appointment endpoint
        const providersRes = await fetch('/api/appointment/available-providers');
        const providersJson = await providersRes.json();
        // The endpoint may return data wrapped in success/data or directly
        const rawProviders = providersJson.data || providersJson;
        if (Array.isArray(rawProviders)) {
          const mapped = rawProviders.map((p: any) => ({
            id: p.id || p.providerId || p.slug || p._id || '',
            fullName: p.fullName || p.providerName || 'Unknown Provider',
            profession: p.profession || p.specialty || 'GENERAL_PAEDIATRICIAN',
            facilityName: p.facilityName || 'Clinic',
          }));
          setProviders(mapped);
        }
      } catch (err) {
        console.error('[API/APPOINTMENT] Error loading metadata for modal:', err);
      }
    };

    loadMetadata();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Date is required';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenDropdown(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: formData.patientId,
        providerId: formData.providerId,
        appointmentDate: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString(),
        reasonText: formData.reasonText,
      };
      await createAppointment(payload);
      setFormData({
        patientId: '',
        providerId: '',
        appointmentDate: '',
        appointmentTime: '',
        reasonText: '',
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleModalClose = () => {
    setOpenDropdown(null);
    onClose();
  };

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: patient.fullName,
  }));

  const providerOptions = providers.map((provider) => ({
    value: provider.id,
    label: `${provider.fullName} - ${getProfessionLabel(provider.profession)}`,
  }));

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div className="mx-auto flex min-h-[620px] w-full max-w-3xl flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Create Appointment</h2>
            <p className="mt-1 text-base text-slate-500">Schedule a new appointment</p>
          </div>

            <button
              type="button"
              onClick={handleModalClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="mt-8 flex h-full flex-col">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Appointment mode</label>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
                    In system
                  </div>
                </div>
              </div>

            {/* Patient Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Patient</label>
              <SmallDropdown
                value={formData.patientId}
                options={patientOptions}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, patientId: value }));
                  setErrors((prev) => ({ ...prev, patientId: '' }));
                }}
                ariaLabel="Select patient"
                placeholder="Select a patient"
                open={openDropdown === 'patient'}
                onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'patient' : null)}
                pageSize={4}
              />
              {errors.patientId && (
                <p className="mt-1 text-xs text-red-600">{errors.patientId}</p>
              )}
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Provider</label>
              <SmallDropdown
                value={formData.providerId}
                options={providerOptions}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, providerId: value }));
                  setErrors((prev) => ({ ...prev, providerId: '' }));
                }}
                ariaLabel="Select provider"
                placeholder="Select a provider"
                open={openDropdown === 'provider'}
                onOpenChange={(nextOpen) => setOpenDropdown(nextOpen ? 'provider' : null)}
                pageSize={4}
              />
              {errors.providerId && (
                <p className="mt-1 text-xs text-red-600">{errors.providerId}</p>
              )}
            </div>

            {/* Date and Time */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-full border border-slate-200 bg-white px-4 pl-11 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-emerald-500 ${
                      errors.appointmentDate ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.appointmentDate}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Time</label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-full border border-slate-200 bg-white px-4 pl-11 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-emerald-500 ${
                      errors.appointmentTime ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.appointmentTime && (
                  <p className="mt-1 text-xs text-red-600">{errors.appointmentTime}</p>
                )}
              </div>

            {/* Reason */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Reason for Appointment</label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  name="reasonText"
                  value={formData.reasonText}
                  onChange={handleChange}
                  placeholder="Enter the reason for this appointment"
                  rows={4}
                  className={`min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 ${
                    errors.reasonText ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {errors.reasonText && (
                <p className="mt-1 text-xs text-red-600">{errors.reasonText}</p>
              )}
            </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto flex items-center justify-end gap-3 pt-10">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-5 py-2 text-xs font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

export default function AppointmentAdminPage() {
  const [filters, setFilters] = useState({
    status: 'all',
  });
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error('[API/APPOINTMENT] Error fetching appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments based on selected status
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Status filter
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false;
      }
      // Calendar filter
      if (viewMode === 'calendar' && selectedDate) {
        const aptDate = new Date(appointment.appointmentDate);
        return (
          aptDate.getFullYear() === selectedDate.getFullYear() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getDate() === selectedDate.getDate()
        );
      }
      return true;
    });
  }, [appointments, filters, viewMode, selectedDate]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchAppointments();
  };

  const handleBoardWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      event.currentTarget.scrollLeft += event.deltaY || event.deltaX;
      return;
    }

    if (!target.closest('[data-appointment-lane]')) {
      event.preventDefault();
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      {/* Header with Create Button, Filters, and View Toggle */}
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">
            Appointments
          </h1>
          <p className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            View and manage patient appointments
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Create Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Plus size={16} />
            </span>
            Create Appointment
          </button>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatusPickerOpen(!statusPickerOpen);
              }}
              className="flex h-10 w-[120px] items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300"
            >
              <span className="truncate">{filters.status === 'all' ? 'All Status' : filters.status}</span>
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${statusPickerOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {/* Status Picker Dropdown */}
            {statusPickerOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleFilterChange({ status: 'all' });
                      setStatusPickerOpen(false);
                    }}
                    className={`flex w-full px-3 py-1 text-left text-[9px] ${filters.status === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange({ status: 'PENDING' });
                      setStatusPickerOpen(false);
                    }}
                    className={`flex w-full px-3 py-1 text-left text-[9px] ${filters.status === 'PENDING' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange({ status: 'APPROVED' });
                      setStatusPickerOpen(false);
                    }}
                    className={`flex w-full px-3 py-1 text-left text-[9px] ${filters.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange({ status: 'RESCHEDULED' });
                      setStatusPickerOpen(false);
                    }}
                    className={`flex w-full px-3 py-1 text-left text-[9px] ${filters.status === 'RESCHEDULED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Rescheduled
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange({ status: 'CANCELLED' });
                      setStatusPickerOpen(false);
                    }}
                    className={`flex w-full px-3 py-1 text-left text-[9px] ${filters.status === 'CANCELLED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div>
            <button
              className={`rounded-full px-4 py-2 text-xs font-bold mr-2 ${viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban View
            </button>
            <button
              className={`rounded-full px-4 py-2 text-xs font-bold ${viewMode === 'calendar' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      )}
      {!isLoading && error && (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/30 p-8">
          <div className="text-center">
            <p className="mb-1 text-sm font-medium text-red-600">Could not load appointments</p>
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Kanban or Calendar View */}
      {!isLoading && !error && viewMode === 'kanban' ? (
        <div
          onWheel={handleBoardWheel}
          className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-auto overflow-y-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex h-full w-max gap-4">
            {PROVIDER_COLUMNS.map((profession) => {
              const professionAppointments = filteredAppointments.filter(
                (apt) => apt.provider.profession === profession
              );
              const professionMeta = PROVIDER_COLUMN_META[profession];

              return (
                <div
                  key={profession}
                  className={`flex h-full w-[280px] shrink-0 flex-col rounded-xl border ${professionMeta.border} ${professionMeta.color} p-3 shadow-sm lg:w-[300px]`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-white/70">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${professionMeta.accent}`} />
                      <h3 className="truncate text-[12px] font-bold text-slate-900">
                        {professionMeta.label}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                      {professionAppointments.length}
                    </span>
                  </div>
                  <div
                    data-appointment-lane
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {professionAppointments.length === 0 ? (
                      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/80 text-[11px] font-medium text-slate-400">
                        No appointments
                      </div>
                    ) : (
                      professionAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Calendar View
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={e => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-xs text-slate-500">{selectedDate ? `Appointments for ${selectedDate.toLocaleDateString()}` : 'Select a date to view appointments'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAppointments.length === 0 ? (
              <div className="col-span-full flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-400">
                No appointments found
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'PENDING':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'RESCHEDULED':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 ring-1 ring-red-100';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}
