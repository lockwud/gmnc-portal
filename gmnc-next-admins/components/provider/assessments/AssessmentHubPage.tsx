'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';

type Patient = {
  id: string;
  fullName: string;
  caregiverName: string;
  age: number;
  latestAssessmentStatus?: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | null;
};

type AssessmentHistoryItem = {
  id: string;
  toolCode: string;
  toolVersion: string;
  status: 'DRAFT' | 'COMPLETED' | 'REVIEWED';
  assessedAt: string;
  summary?: string;
};

const mockPatients: Patient[] = [
  {
    id: 'cp-001',
    fullName: 'Kwame Mensah',
    caregiverName: 'Akosua Mensah',
    age: 7,
    latestAssessmentStatus: 'COMPLETED',
  },
  {
    id: 'cp-002',
    fullName: 'Ama Serwaa',
    caregiverName: 'Yaa Serwaa',
    age: 8,
    latestAssessmentStatus: 'DRAFT',
  },
  {
    id: 'cp-003',
    fullName: 'Kofi Owusu',
    caregiverName: 'Adwoa Owusu',
    age: 10,
    latestAssessmentStatus: 'REVIEWED',
  },
];

const mockAssessmentHistory: Record<string, AssessmentHistoryItem[]> = {
  'cp-001': [
    {
      id: 'asmt-001',
      toolCode: 'GMFM-66',
      toolVersion: '1.0.0',
      status: 'COMPLETED',
      assessedAt: '2026-05-01T10:30:00.000Z',
      summary: 'Gross motor performance improved across standing and walking dimensions.',
    },
    {
      id: 'asmt-002',
      toolCode: 'MACS',
      toolVersion: '1.0.0',
      status: 'REVIEWED',
      assessedAt: '2026-04-14T09:00:00.000Z',
      summary: 'Manual ability remains stable with mild difficulty in bimanual tasks.',
    },
  ],
  'cp-002': [
    {
      id: 'asmt-003',
      toolCode: 'CFCS',
      toolVersion: '1.0.0',
      status: 'DRAFT',
      assessedAt: '2026-05-03T12:00:00.000Z',
      summary: 'Communication review in progress.',
    },
  ],
  'cp-003': [],
};

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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    mockPatients[0]?.id ?? null
  );

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockPatients;

    return mockPatients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(term) ||
        patient.caregiverName.toLowerCase().includes(term)
      );
    });
  }, [search]);

  const selectedPatient =
    mockPatients.find((patient) => patient.id === selectedPatientId) ?? null;

  const selectedHistory = selectedPatient
    ? mockAssessmentHistory[selectedPatient.id] ?? []
    : [];

  const handleCreateAssessment = () => {
    if (!selectedPatient) return;
    router.push(`/provider/assessments/create?patientId=${selectedPatient.id}`);
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
            {filteredPatients.length === 0 ? (
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
                          Caregiver: {patient.caregiverName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {patient.age} yrs
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
                ? `Caregiver: ${selectedPatient.caregiverName} • ${selectedPatient.age} yrs`
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
                    router.push(`/provider/assessments/${assessment.id}/report`)
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
                        {assessment.summary || 'No summary available.'}
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