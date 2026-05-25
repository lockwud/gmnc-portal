'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import EmptyState from '@/components/ui/EmptyState';

type PatientRow = {
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  caregiver: {
    name: string;
  };
  latestAssessmentStatus?: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | null;
  nextAppointmentDate?: string | null;
  openTasksCount: number;
  latestReferralStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | null;
  slug: string;
};

// Keep mock data as fallback or for initial dev if needed, 
// but we will primarily use the fetched data now.
const mockPatients: PatientRow[] = [];

function calculateAge(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAssessmentBadgeClass(status?: PatientRow['latestAssessmentStatus']) {
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

function getReferralBadgeClass(status?: PatientRow['latestReferralStatus']) {
  switch (status) {
    case 'COMPLETED':
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'PENDING':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    case 'DECLINED':
      return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

function getTaskBadgeClass(count: number) {
  if (count > 0) {
    return 'bg-amber-50 text-slate-900 ring-1 ring-amber-100';
  }
  return 'bg-slate-100 text-slate-900 ring-1 ring-slate-200';
}

export default function CpPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/patients');
      const result = await response.json();

      // Accept both 'status' and 'success' for compatibility
      if ((result.status || result.success) && Array.isArray(result.data)) {
        const mapped = result.data.map((p: any) => {
          const userObj = p.user || p;
          return {
            slug: userObj.slug || userObj.id || userObj._id || p.id || '',
            fullName: userObj.fullName || userObj.name || p.fullName || 'Unknown Patient',
            gender: ((userObj.gender || p.gender || '').toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE') as 'MALE' | 'FEMALE',
            dateOfBirth: userObj.dateOfBirth || p.dateOfBirth || new Date().toISOString(),
            caregiver: {
              name: p.caregiver?.fullName || p.caregiver?.name || p.caregiver?.user?.fullName || userObj.caregiver?.fullName || userObj.caregiver?.name || '—',
            },
            latestAssessmentStatus: p.latestAssessmentStatus || userObj.latestAssessmentStatus || null,
            nextAppointmentDate: p.nextAppointmentDate || userObj.nextAppointmentDate || null,
            openTasksCount: p.openTasksCount || userObj.openTasksCount || 0,
            latestReferralStatus: p.latestReferralStatus || userObj.latestReferralStatus || null,
          };
        });
        setPatients(mapped);
      } else {
        setError(result.message || 'Failed to load patients');
      }
    } catch (err) {
      setError('An error occurred while fetching patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (genderFilter === 'ALL') return patients;
    return patients.filter((patient) => patient.gender === genderFilter);
  }, [patients, genderFilter]);

  const totalItems = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const handleRowClick = (slug: string) => {
    router.push(`/provider/cp-patient/${slug}`);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">CP Patient</h1>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => {
              setGenderFilter('ALL');
              setPage(1);
            }}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              genderFilter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderFilter('MALE');
              setPage(1);
            }}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              genderFilter === 'MALE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderFilter('FEMALE');
              setPage(1);
            }}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              genderFilter === 'FEMALE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
        <div className="flex h-full min-h-0 flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 bg-slate-50/30">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-medium text-slate-500">Loading patients...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-rose-200 bg-rose-50/30">
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <AlertCircle className="h-8 w-8 text-rose-500" />
                <h4 className="text-sm font-bold text-slate-900">Unable to load data</h4>
                <p className="max-w-xs text-xs font-medium text-slate-500">{error}</p>
                <button
                  onClick={() => fetchPatients()}
                  className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Retry Now
                </button>
              </div>
            </div>
          ) : totalItems === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
              <div className="w-full max-w-md">
                <EmptyState
                  title="No patients found"
                  description="There are no patients available at the moment."
                />
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white">
                <div className="h-full overflow-auto scrollbar-none">
                  <table className="w-full min-w-[860px] border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Caregiver</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Age</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Assessment</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Next Appointment</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Open Tasks</th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium">Referral</th>
                        <th className="px-4 py-3 text-center text-[11px] font-medium">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedPatients.map((patient, index) => (
                        <tr
                          key={patient.slug}
                          onClick={() => handleRowClick(patient.slug)}
                          className={`cursor-pointer transition ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                          } hover:bg-emerald-50`}
                        >
                          <td className="border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                {patient.fullName
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {patient.fullName}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {patient.caregiver.name}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {calculateAge(patient.dateOfBirth)} yrs
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getAssessmentBadgeClass(
                                patient.latestAssessmentStatus
                              )}`}
                            >
                              {patient.latestAssessmentStatus ?? 'None'}
                            </span>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {formatDate(patient.nextAppointmentDate)}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3">
                            <span
                              className={`inline-flex min-w-7 justify-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getTaskBadgeClass(
                                patient.openTasksCount
                              )}`}
                            >
                              {patient.openTasksCount}
                            </span>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getReferralBadgeClass(
                                patient.latestReferralStatus
                              )}`}
                            >
                              {patient.latestReferralStatus ?? 'None'}
                            </span>
                          </td>

                          <td
                            className="border-b border-slate-100 px-4 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-center">
                              <RowActions
                                onEdit={() => console.log('Edit patient', patient.slug)}
                                onDelete={() => console.log('Delete patient', patient.slug)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-slate-200 bg-white">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}