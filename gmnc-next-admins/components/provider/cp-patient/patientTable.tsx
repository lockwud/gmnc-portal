'use client';

import React, { useMemo, useState } from 'react';
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

const mockPatients: PatientRow[] = [
  {
    slug: 'kwame-mensah',
    fullName: 'Kwame Mensah',
    gender: 'MALE',
    dateOfBirth: '2018-05-10',
    caregiver: {
      name: 'Akosua Mensah',
    },
    latestAssessmentStatus: 'COMPLETED',
    nextAppointmentDate: '2026-05-20T09:00:00.000Z',
    openTasksCount: 2,
    latestReferralStatus: 'PENDING',
  },
  {
    slug: 'ama-serwaa',
    fullName: 'Ama Serwaa',
    gender: 'FEMALE',
    dateOfBirth: '2017-11-21',
    caregiver: {
      name: 'Yaa Serwaa',
    },
    latestAssessmentStatus: 'DRAFT',
    nextAppointmentDate: null,
    openTasksCount: 1,
    latestReferralStatus: 'ACCEPTED',
  },
  {
    slug: 'kofi-owusu',
    fullName: 'Kofi Owusu',
    gender: 'MALE',
    dateOfBirth: '2016-02-03',
    caregiver: {
      name: 'Adwoa Owusu',
    },
    latestAssessmentStatus: 'REVIEWED',
    nextAppointmentDate: '2026-05-18T14:30:00.000Z',
    openTasksCount: 4,
    latestReferralStatus: 'COMPLETED',
  },
];

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  const filteredPatients = useMemo(() => {
    if (genderFilter === 'ALL') return mockPatients;
    return mockPatients.filter((patient) => patient.gender === genderFilter);
  }, [genderFilter]);

  const totalItems = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, page, pageSize]);

  const handleRowClick = (slug: string) => {
    router.push(`/provider/cp-patient/${slug}`);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-1">
        <h1 className="text-[18px] font-semibold text-slate-900">CP Patient</h1>

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

      {totalItems === 0 ? (
        <div className="flex-1">
          <EmptyState
            title="No patients found"
            description="There are no patients available at the moment."
          />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              className="h-full overflow-auto no-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <table className="w-full min-w-[860px] border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-emerald-600 text-white">
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Patient
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Caregiver
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Age
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Assessment
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Next Appointment
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Open Tasks
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium">
                      Referral
                    </th>
                    <th className="px-3 py-2 text-center text-[11px] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPatients.map((patient, index) => (
                    <tr
                      key={patient.slug}
                      onClick={() => handleRowClick(patient.slug)}
                      className={`cursor-pointer transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      } hover:bg-emerald-50`}
                    >
                      <td className="border-b border-slate-100 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                            {patient.fullName
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-slate-900">
                              {patient.fullName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-[13px] font-medium text-slate-700">
                          {patient.caregiver.name}
                        </p>
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2 text-[13px] text-slate-600 whitespace-nowrap">
                        {calculateAge(patient.dateOfBirth)} yrs
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getAssessmentBadgeClass(
                            patient.latestAssessmentStatus
                          )}`}
                        >
                          {patient.latestAssessmentStatus ?? 'None'}
                        </span>
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2 text-[13px] text-slate-600 whitespace-nowrap">
                        {formatDate(patient.nextAppointmentDate)}
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2">
                        <span
                          className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getTaskBadgeClass(
                            patient.openTasksCount
                          )}`}
                        >
                          {patient.openTasksCount}
                        </span>
                      </td>

                      <td className="border-b border-slate-100 px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getReferralBadgeClass(
                            patient.latestReferralStatus
                          )}`}
                        >
                          {patient.latestReferralStatus ?? 'None'}
                        </span>
                      </td>

                      <td
                        className="border-b border-slate-100 px-3 py-2 text-center"
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

          <div className="border-t border-slate-200 bg-white">
            <Pagination
              page={page}
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
  );
}