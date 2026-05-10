'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { useToast } from '@/components/ui/Toast';
import { ChevronDown, Eye, EyeOff, Mail, Phone, Plus, User, X } from 'lucide-react';

type UserType = 'ALL' | 'CAREGIVER' | 'SERVICE_PROVIDER' | 'ADMIN';
type RegistrationStep = 1 | 2 | 3;

type UserRecord = {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber: string;
  userType: Exclude<UserType, 'ALL'>;
  accountStatus: 'ACTIVE' | 'PENDING' | 'INVITED';
  updatedAt: string;
};

const mockUsers: UserRecord[] = [
  {
    id: 'USR-001',
    fullName: 'Akosua Mensah',
    email: 'akosua.mensah@example.com',
    phoneNumber: '+233 24 000 1201',
    userType: 'CAREGIVER',
    accountStatus: 'ACTIVE',
    updatedAt: '2026-05-08T09:20:00.000Z',
  },
  {
    id: 'USR-002',
    fullName: 'Dr. Louisa Parker',
    email: 'louisa.parker@example.com',
    phoneNumber: '+233 20 555 0189',
    userType: 'SERVICE_PROVIDER',
    accountStatus: 'INVITED',
    updatedAt: '2026-05-09T11:45:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Michael Addo',
    email: 'michael.addo@gmnc.com',
    phoneNumber: '+233 27 444 2200',
    userType: 'ADMIN',
    accountStatus: 'PENDING',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
];

const roleOptions: { value: UserType; label: string }[] = [
  { value: 'ALL', label: 'All roles' },
  { value: 'CAREGIVER', label: 'Caregiver' },
  { value: 'SERVICE_PROVIDER', label: 'Service provider' },
  { value: 'ADMIN', label: 'Admin' },
];

function formatRole(role: Exclude<UserType, 'ALL'>) {
  switch (role) {
    case 'CAREGIVER':
      return 'Caregiver';
    case 'SERVICE_PROVIDER':
      return 'Service provider';
    case 'ADMIN':
      return 'Admin';
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusClass(status: UserRecord['accountStatus']) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    case 'PENDING':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    case 'INVITED':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }
}

function SmallDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  widthClass = 'w-[180px]',
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300"
      >
        <span className="truncate">{selected?.label}</span>
        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
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
          })}
        </div>
      )}
    </div>
  );
}

export default function UserRegistrationPage() {
  const { show } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<UserType>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [step, setStep] = useState<RegistrationStep>(1);
  const [modalRole, setModalRole] = useState<Exclude<UserType, 'ALL'>>('CAREGIVER');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return mockUsers;
    return mockUsers.filter((user) => user.userType === roleFilter);
  }, [roleFilter]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const resetModalState = () => {
    setIsCreateModalOpen(false);
    setStep(1);
    setModalRole('CAREGIVER');
    setShowPassword(false);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
    });
  };

  const handleCloseModal = () => {
    resetModalState();
  };

  const handleProceed = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as RegistrationStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as RegistrationStep);
    }
  };

  const handleSave = () => {
    console.log('Save user payload', {
      registrationMode: 'SYSTEM',
      userType: modalRole,
      ...formData,
    });

    show({
      title: 'Success',
      message: 'User registration saved successfully.',
      duration: 3000,
    });

    window.setTimeout(() => {
      resetModalState();
    }, 3000);
  };

  return (
    <>
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-[15px] font-semibold text-slate-900">Users</h1>
          </div>

          <div className="flex items-center gap-2">
            <SmallDropdown
              value={roleFilter}
              options={roleOptions}
              onChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
              ariaLabel="Filter users by role"
            />

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Plus size={10} strokeWidth={2.5} />
              </span>
              Create
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-white px-4 pt-2 pb-4">
          <div className="flex h-full min-h-0 flex-col gap-2">
            {totalItems === 0 ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
                <div className="w-full max-w-md">
                  <EmptyState
                    title="No registrations found"
                    description="There are no users in this role yet. Create a registration to add someone."
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white">
                  <div className="h-full overflow-auto scrollbar-none">
                    <table className="w-full min-w-[980px] border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-emerald-600 text-white">
                          <th className="px-4 py-3 text-left text-[11px] font-medium">User</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Role</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Phone</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-medium">Updated</th>
                          <th className="px-4 py-3 text-center text-[11px] font-medium">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedUsers.map((user, index) => (
                          <tr
                            key={user.id}
                            className={`transition ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            } hover:bg-emerald-50`}
                          >
                            <td className="border-b border-slate-100 px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                  {user.fullName
                                    .split(' ')
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {user.fullName}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                              {formatRole(user.userType)}
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                              {user.email || '��'}
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                              {user.phoneNumber}
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                                  user.accountStatus
                                )}`}
                              >
                                {user.accountStatus}
                              </span>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                              {formatDate(user.updatedAt)}
                            </td>

                            <td
                              className="border-b border-slate-100 px-4 py-3 text-center"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex justify-center">
                                <RowActions
                                  onEdit={() => console.log('Edit user', user.id)}
                                  onDelete={() => console.log('Delete user', user.id)}
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

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal}>
        <div className="mx-auto flex min-h-[620px] w-full max-w-3xl flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Registration</h2>
              <p className="mt-1 text-base text-slate-500">Step {step} of 3</p>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1">
            {step === 1 && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Registration mode</label>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
                      In system
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">User role</label>
                  <SmallDropdown
                    value={modalRole}
                    options={roleOptions.filter(
                      (option): option is { value: Exclude<UserType, 'ALL'>; label: string } =>
                        option.value !== 'ALL'
                    )}
                    onChange={setModalRole}
                    ariaLabel="Select registration role"
                    widthClass="w-full"
                  />
                </div>

                <Input
                  placeholder="Full name"
                  icon={<User size={16} />}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  containerClassName="md:col-span-2"
                />

                <Input
                  placeholder="Email address"
                  icon={<Mail size={16} />}
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />

                <Input
                  placeholder="Phone number"
                  icon={<Phone size={16} />}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                />
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 grid gap-6">
                <div className="relative max-w-xl">
                  <Input
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-base font-semibold text-slate-900">Review information</p>

                  <div className="mt-4 grid gap-4 text-base text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-900">Mode:</span> In system
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Role:</span> {formatRole(modalRole)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Full name:</span>{' '}
                      {formData.fullName || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Email:</span>{' '}
                      {formData.email || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Phone:</span>{' '}
                      {formData.phoneNumber || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Password:</span> ••••••••
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 pt-6">
            {step > 1 && (
              <Button
                variant="secondary"
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleBack}
              >
                Back
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="secondary"
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleProceed}
              >
                Proceed
              </Button>
            ) : (
              <Button
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}