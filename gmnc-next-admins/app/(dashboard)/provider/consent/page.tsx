'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { listConsents, createConsent, revokeConsent, type ConsentRecord } from '@/lib/api/consent';
import { getPatients, type PatientItem } from '@/lib/api/patients';
import type { ConsentType, ConsentMethod } from '@/lib/api/types';

const CONSENT_TYPES: ConsentType[] = [
  'TREATMENT',
  'DATA_SHARING',
  'RECORDING',
  'PHOTO_VIDEO',
  'RESEARCH',
];

const CONSENT_METHODS: ConsentMethod[] = ['DIGITAL_SIGNATURE', 'SMS', 'PAPER'];

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConsentMethodBadge({ method }: { method?: ConsentMethod | string | null }) {
  const label = typeof method === 'string' ? method : 'DIGITAL_SIGNATURE';
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
      {label}
    </span>
  );
}

export default function ProviderConsentPage() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    patientId: string;
    consentType: ConsentType;
    scope?: string;
    documentId?: string;
    method: ConsentMethod;
  }>({
    patientId: '',
    consentType: 'TREATMENT',
    scope: '',
    documentId: '',
    method: 'DIGITAL_SIGNATURE',
  });

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );
  const detailRecord = useMemo(
    () => records.find((record) => record.id === detailRecordId) ?? null,
    [records, detailRecordId],
  );

  useEffect(() => {
    let active = true;
    async function loadPatients() {
      try {
        setLoadingPatients(true);
        setError(null);
        const result = await getPatients();
        if (!active) return;
        const mapped = (result.data || []).map((p) => ({
          id: p.patientId || p.id,
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          caregiverName: p.caregiverName || p.caregiver?.user?.fullName,
        }));
        setPatients(mapped);
        setSelectedPatientId((current) => current ?? mapped[0]?.id ?? null);
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

  const loadConsents = useCallback(async (patientId: string) => {
    if (!patientId.trim()) {
      setRecords([]);
      return;
    }
    try {
      setLoadingConsents(true);
      setError(null);
      const data = await listConsents(patientId.trim());
      setRecords(data ?? []);
      setDetailRecordId((current) => current ?? data?.[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consents.');
    } finally {
      setLoadingConsents(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setForm((current) => ({ ...current, patientId: selectedPatientId }));
      void loadConsents(selectedPatientId);
    }
  }, [selectedPatientId, loadConsents]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) => patient.fullName.toLowerCase().includes(term));
  }, [patients, search]);

  const handleRevoke = async (recordId: string) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await revokeConsent(recordId);
      setRecords((current) =>
        current.map((record) => (record.id === recordId ? updated : record)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke consent.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.patientId.trim()) {
      setError('Patient ID is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const created = await createConsent({
        patientId: form.patientId.trim(),
        consentType: form.consentType,
        scope: form.scope?.trim() || undefined,
        documentId: form.documentId?.trim() || undefined,
        method: form.method,
      });
      setRecords((current) => [created, ...current]);
      setForm((current) => ({ ...current, scope: '', documentId: '' }));
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record consent.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="provider">
      <div className="flex h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-white">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h1 className="text-[15px] font-semibold text-slate-900">Consent Management</h1>
            <p className="mt-1 text-xs text-slate-500">Select a patient to review consents.</p>

            <div className="mt-3">
              <input
                type="text"
                placeholder="Search patient..."
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
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
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
                      <p className="truncate text-sm font-semibold text-slate-900">{patient.fullName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {patient.caregiverName ?? 'Caregiver —'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <h2 className="text-[15px] font-semibold text-slate-900">
              {selectedPatient ? selectedPatient.fullName : 'Consent Management'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedPatient
                ? `Caregiver: ${selectedPatient.caregiverName ?? '—'}`
                : 'Select a patient from the left panel.'}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            {!selectedPatient ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Select a patient to view consents.
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : (
              <div className="mx-auto max-w-6xl space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Consent records</h3>
                    <button
                      type="button"
                      onClick={() => setShowForm((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      {showForm ? 'Cancel' : 'New consent'}
                    </button>
                  </div>

                  {showForm && (
                    <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Patient</label>
                        <input
                          type="text"
                          value={selectedPatient.fullName}
                          readOnly
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                        />
                        <input type="hidden" value={form.patientId} readOnly />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Consent type</label>
                        <select
                          value={form.consentType}
                          onChange={(e) => setForm((current) => ({ ...current, consentType: e.target.value as ConsentType }))}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                        >
                          {CONSENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Method</label>
                        <select
                          value={form.method}
                          onChange={(e) => setForm((current) => ({ ...current, method: e.target.value as ConsentMethod }))}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                        >
                          {CONSENT_METHODS.map((method) => (
                            <option key={method} value={method}>
                              {method.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Scope (optional)</label>
                        <input
                          type="text"
                          value={form.scope ?? ''}
                          onChange={(e) => setForm((current) => ({ ...current, scope: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600">Document ID (optional)</label>
                        <input
                          type="text"
                          value={form.documentId ?? ''}
                          onChange={(e) => setForm((current) => ({ ...current, documentId: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? 'Saving...' : 'Record consent'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="mt-4">
                    {loadingConsents ? (
                      <p className="text-xs text-slate-500">Loading consents...</p>
                    ) : records.length === 0 ? (
                      <p className="text-xs text-slate-500">No consent records found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead>
                            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                              <th className="pb-2 font-medium">Type</th>
                              <th className="pb-2 font-medium">Method</th>
                              <th className="pb-2 font-medium">Granted</th>
                              <th className="pb-2 font-medium">Revoked</th>
                              <th className="pb-2 font-medium text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record) => (
                              <tr
                                key={record.id}
                                className={`cursor-pointer border-b border-slate-100 last:border-0 ${
                                  detailRecordId === record.id ? 'bg-slate-50' : ''
                                }`}
                                onClick={() => setDetailRecordId(record.id)}
                              >
                                <td className="py-2 font-medium text-slate-900">{record.consentType.replace(/_/g, ' ')}</td>
                                <td className="py-2">
                                  <ConsentMethodBadge method={record.method} />
                                </td>
                                <td className="py-2">{formatDateTime(record.grantedAt)}</td>
                                <td className="py-2">{record.revokedAt ? formatDateTime(record.revokedAt) : '—'}</td>
                                <td className="py-2 text-right">
                                  {!record.revokedAt ? (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        void handleRevoke(record.id);
                                      }}
                                      disabled={saving}
                                      className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Revoke
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Revoked</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-900">Consent Detail</h3>
                  {!detailRecord ? (
                    <p className="mt-2 text-xs text-slate-500">Select a record from the table above to view details.</p>
                  ) : (
                    <dl className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Record ID</dt>
                        <dd className="mt-1 break-all">{detailRecord.id}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient ID</dt>
                        <dd className="mt-1 break-all">{detailRecord.patientId}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</dt>
                        <dd className="mt-1">{detailRecord.consentType.replace(/_/g, ' ')}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Method</dt>
                        <dd className="mt-1">
                          <ConsentMethodBadge method={detailRecord.method} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Granted</dt>
                        <dd className="mt-1">{formatDateTime(detailRecord.grantedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revoked</dt>
                        <dd className="mt-1">{detailRecord.revokedAt ? formatDateTime(detailRecord.revokedAt) : '—'}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Scope</dt>
                        <dd className="mt-1">{detailRecord.scope || '—'}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Document ID</dt>
                        <dd className="mt-1">{detailRecord.documentId || '—'}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
