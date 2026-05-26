'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import { getPatients, type PatientItem } from '@/lib/api/patients';
import { getPatientAssessments } from '@/lib/api/assessments';
import type { AssessmentListItem } from '@/lib/api/types';

type Patient = PatientItem & {
  age?: number;
  latestAssessmentStatus?: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | null;
};

function calculateAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'REVIEWED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

export default function AssessmentHubPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<AssessmentListItem[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      try {
        setLoadingPatients(true);
        setError(null);

        const result = await getPatients();
        if (!active) return;

        const mappedPatients = (result.data || []).map((patient: PatientItem) => ({
          ...patient,
          caregiverName: patient.caregiverName || patient.caregiver?.user?.fullName || '',
          age: calculateAge(patient.dateOfBirth),
        }));

        setPatients(mappedPatients);
        setSelectedPatientId((current) => current ?? mappedPatients[0]?.id ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load patients.');
      } finally {
        if (active) setLoadingPatients(false);
      }
    }

    loadPatients();
    return () => {
      active = false;
    };
  }, []);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? null;

  const assessmentPatientId = selectedPatient
    ? (selectedPatient.patientId || selectedPatient.id)
    : null;

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (!assessmentPatientId) {
        setSelectedHistory([]);
        setLoadingHistory(false);
        return;
      }

      try {
        setLoadingHistory(true);
        setError(null);
        setSelectedHistory([]);

        const result = await getPatientAssessments(assessmentPatientId);
        if (!active) return;

        setSelectedHistory(result.assessments || []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load assessment history.');
      } finally {
        if (active) setLoadingHistory(false);
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [assessmentPatientId]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;

    return patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(term) ||
        (patient.caregiverName ?? '').toLowerCase().includes(term)
      );
    });
  }, [patients, search]);

  const handleCreateAssessment = () => {
    if (!selectedPatient) return;
    const params = new URLSearchParams();
    if (assessmentPatientId) params.set('patientId', assessmentPatientId);
    if (selectedPatient.fullName) params.set('patientName', selectedPatient.fullName);
    if (selectedPatient.gender) params.set('patientGender', selectedPatient.gender);
    if (selectedPatient.dateOfBirth) params.set('patientDob', selectedPatient.dateOfBirth);
    if (selectedPatient.caregiverName) params.set('caregiverName', selectedPatient.caregiverName);
    router.push(`/provider/assessments/create?${params.toString()}`);
  };

  const reportHref = (assessment: AssessmentListItem) => {
    const params = new URLSearchParams();
    if (assessment.toolCode) params.set('toolCode', assessment.toolCode);
    if (assessment.status) params.set('status', assessment.status);
    if (assessment.assessedAt) params.set('assessedAt', assessment.assessedAt);
    if (selectedPatient?.fullName) params.set('patientName', selectedPatient.fullName);
    if (selectedPatient?.gender) params.set('patientGender', selectedPatient.gender);
    if (selectedPatient?.dateOfBirth) params.set('patientDob', selectedPatient.dateOfBirth);
    if (selectedPatient?.caregiverName) params.set('caregiverName', selectedPatient.caregiverName);
    const query = params.toString();
    return `/provider/assessments/${assessment.id}/report${query ? `?${query}` : ''}`;
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-white">
      <aside className="flex w-[320px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h1 className="text-[15px] font-semibold text-slate-900">Assessments</h1>
          <p className="mt-1 text-xs text-slate-500">
            Select a patient to review history or start a new assessment.
          </p>

          <div className="mt-3">
            <input
              type="text"
              placeholder="Search patient or caregiver"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="space-y-2">
            {loadingPatients ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading patients...
              </div>
            ) : error && patients.length === 0 ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No patients found.
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const selected = patient.id === selectedPatientId;

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      selected
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {patient.fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          Caregiver: {patient.caregiverName ?? '—'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {patient.age != null ? `${patient.age} yrs` : 'Age unknown'}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(
                          patient.latestAssessmentStatus
                        )}`}
                      >
                        {patient.latestAssessmentStatus ?? 'None'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              {selectedPatient ? selectedPatient.fullName : 'Assessment Workspace'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {selectedPatient
                ? `Caregiver: ${selectedPatient.caregiverName ?? '—'} • ${selectedPatient.age != null ? `${selectedPatient.age} yrs` : 'Age unknown'}`
                : 'Choose a patient from the left panel.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateAssessment}
            disabled={!selectedPatient}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50 px-4 py-4">
          {!selectedPatient ? (
            <EmptyState
              title="Select a patient"
              description="Choose a patient from the left panel to view assessment history and begin a new assessment."
            />
          ) : loadingHistory ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading assessment history...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : selectedHistory.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-md">
                <EmptyState
                  title="No assessments yet"
                  description="This patient has no assessment history yet. Start the first assessment to begin clinical tracking."
                />

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCreateAssessment}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Start First Assessment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedHistory.map((assessment) => (
                <button
                  key={assessment.id}
                  type="button"
                  onClick={() =>
                    router.push(reportHref(assessment))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {assessment.toolCode}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(
                            assessment.status
                          )}`}
                        >
                          {assessment.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Version: {assessment.toolVersion}</span>
                        <span>Assessed: {formatDateTime(assessment.assessedAt)}</span>
                      </div>

                      <p className="line-clamp-2 text-sm text-slate-600">
                        {assessment.report?.summary || 'No summary available.'}
                      </p>
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
          )}
        </div>
      </main>
    </div>
  );
}
