'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import CalendarPopover from '@/components/ui/CalendarPopover';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import { ChevronDown, Eye, EyeOff, Mail, Phone, Plus, User, X, Calendar } from 'lucide-react';

type UserType = 'ALL' | 'CAREGIVER' | 'SERVICE_PROVIDER' | 'ADMIN';
type RegistrationStep = 1 | 2 | 3;
type Gender = 'MALE' | 'FEMALE';
type OtpChannel = 'sms' | 'email';

type UserRecord = {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber: string;
  userType: Exclude<UserType, 'ALL'>;
  accountStatus: 'ACTIVE' | 'PENDING' | 'INVITED';
  updatedAt: string;
  gender?: Gender;
  dateOfBirth?: string;
  otpChannel?: OtpChannel;
};

const roleOptions: { value: UserType; label: string }[] = [
  { value: 'ALL', label: 'All user types' },
  { value: 'CAREGIVER', label: 'Caregiver' },
  { value: 'SERVICE_PROVIDER', label: 'Service provider' },
  { value: 'ADMIN', label: 'Admin' },
];

function formatUserType(role: Exclude<UserType, 'ALL'>) {
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
  const { isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setFetchError(null);
    try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        });
      const result = await response.json();
      if (result.success) {
        const rawData = result.data;
        const usersList: any[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.users)
            ? rawData.users
            : [];

        const normalized: UserRecord[] = usersList.map((u: any) => {
          const userObj = u.user || u;
          return {
            id: userObj.id || userObj._id || Math.random().toString(),
            fullName: userObj.fullName || userObj.name || 'Unknown User',
            email: userObj.email || null,
            phoneNumber: userObj.phoneNumber || userObj.phone || 'N/A',
            userType: (userObj.userType || 'CAREGIVER') as Exclude<UserType, 'ALL'>,
            accountStatus: (userObj.accountStatus || 'ACTIVE') as UserRecord['accountStatus'],
            updatedAt: userObj.updatedAt || new Date().toISOString(),
            gender: (userObj.gender?.toUpperCase() as Gender) || 'MALE',
            dateOfBirth: userObj.dateOfBirth || '',
            otpChannel: (userObj.otpChannel?.toLowerCase() as OtpChannel) || 'sms',
          };
        });
        setUsers(normalized);
      } else {
        setFetchError(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setFetchError('A network error occurred while fetching users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<UserType>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [step, setStep] = useState<RegistrationStep>(1);
  const [modalRole, setModalRole] = useState<Exclude<UserType, 'ALL'>>('CAREGIVER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    gender: 'MALE' as Gender,
    otpChannel: 'sms' as OtpChannel,
    dateOfBirth: '',
  });

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter((user) => user.userType === roleFilter);
  }, [roleFilter, users]);

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
    setIsSubmitting(false);
    setIsCalendarOpen(false);
    setSelectedDate(undefined);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      gender: 'MALE',
      otpChannel: 'sms',
      dateOfBirth: '',
    });
    setIsEditMode(false);
    setEditingUserId(null);
  };

  const handleEdit = (user: UserRecord) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setModalRole(user.userType);
    setFormData({
      fullName: user.fullName,
      email: user.email || '',
      phoneNumber: user.phoneNumber,
      password: '', // Password not pre-filled
      gender: user.gender || 'MALE',
      otpChannel: user.otpChannel || 'sms',
      dateOfBirth: user.dateOfBirth || '',
    });

    const parsedDate = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);
    } else {
      setSelectedDate(undefined);
    }

    setIsCreateModalOpen(true);
    setStep(1);
  };

  const handleCloseModal = () => {
    resetModalState();
  };

  const handleProceed = () => {
    if (step < 3) {
      setIsCalendarOpen(false);
      setStep((prev) => (prev + 1) as RegistrationStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setIsCalendarOpen(false);
      setStep((prev) => (prev - 1) as RegistrationStep);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/admin/users/${editingUserId}` : '/api/admin/users';
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload: any = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        role: modalRole,
        dateOfBirth: formData.dateOfBirth || undefined,
        otpChannel: modalRole === 'ADMIN' ? 'email' : formData.otpChannel,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        show({
          title: 'Success',
          message: isEditMode ? 'User updated successfully.' : 'User registered successfully.',
          duration: 3000,
        });

        if (isEditMode) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUserId
                ? {
                    ...u,
                    fullName: formData.fullName,
                    email: formData.email || null,
                    phoneNumber: formData.phoneNumber,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth,
                    otpChannel: modalRole === 'ADMIN' ? 'email' : formData.otpChannel,
                    updatedAt: new Date().toISOString(),
                  }
                : u
            )
          );
        } else {
          const newUser: UserRecord = {
            id: result.data?.id || result.data?.user?.id || `new-${Date.now()}`,
            fullName: formData.fullName,
            email: formData.email || null,
            phoneNumber: formData.phoneNumber,
            userType: modalRole as Exclude<UserType, 'ALL'>,
            accountStatus: 'PENDING',
            updatedAt: new Date().toISOString(),
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            otpChannel: modalRole === 'ADMIN' ? 'email' : formData.otpChannel,
          };
          setUsers((prev) => [newUser, ...prev]);
        }

        resetModalState();
        fetchUsers();
      } else {
        show({
          title: 'Error',
          message: result.message || (isEditMode ? 'Failed to update user.' : 'Failed to register user.'),
          duration: 4000,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      show({
        title: 'Error',
        message: 'A network error occurred.',
        duration: 4000,
      });
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
       const res = await fetch(`/api/admin/users/${id}?type=${type}`, { method: 'DELETE', credentials: 'include' });
      const result = await res.json();
      if (result.success) {
        show({ title: 'Deleted', message: 'User removed.', duration: 3000 });
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        show({ title: 'Error', message: result.message || 'Failed to delete.', duration: 4000 });
      }
    } catch {
      show({ title: 'Error', message: 'Network error during delete.', duration: 4000 });
    }
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
              ariaLabel="Filter users by user type"
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
            {isLoadingUsers ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : fetchError ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/30 p-8">
                <div className="text-center">
                  <p className="mb-1 text-sm font-medium text-red-600">Could not load users</p>
                  <p className="text-xs text-red-400">{fetchError}</p>
                  <button
                    onClick={fetchUsers}
                    className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : totalItems === 0 ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white">
                <div className="w-full max-w-md">
                  <EmptyState
                    title="No registrations found"
                    description="There are no users in this user type yet. Create a registration to add someone."
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
                          <th className="px-4 py-3 text-left text-[11px] font-medium">User Type</th>
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
                              {formatUserType(user.userType)}
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
                              {user.email || '—'}
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">
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

                            <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                              {formatDate(user.updatedAt)}
                            </td>

                            <td
                              className="border-b border-slate-100 px-4 py-3 text-center"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex justify-center">
                                <RowActions
                                  onEdit={() => handleEdit(user)}
                                  onDelete={() => handleDelete(user.id, user.userType)}
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
              <h2 className="text-2xl font-semibold text-slate-900">
                {isEditMode ? 'Edit User' : 'Registration'}
              </h2>
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

                <Input
                  placeholder="Full name"
                  icon={<User size={16} />}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  containerClassName="md:col-span-2"
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">User type</label>
                  {isEditMode ? (
                    <div className="flex h-10 w-full items-center rounded-full border border-slate-100 bg-slate-50 px-4 text-sm text-slate-500 cursor-not-allowed">
                      {formatUserType(modalRole)}
                    </div>
                  ) : (
                    <SmallDropdown
                      value={modalRole}
                      options={roleOptions.filter(
                        (option): option is { value: Exclude<UserType, 'ALL'>; label: string } =>
                          option.value !== 'ALL'
                      )}
                      onChange={setModalRole}
                      ariaLabel="Select user type"
                      widthClass="w-full"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <SmallDropdown
                    value={formData.gender}
                    options={[
                      { value: 'MALE' as Gender, label: 'Male' },
                      { value: 'FEMALE' as Gender, label: 'Female' },
                    ]}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                    ariaLabel="Select gender"
                    widthClass="w-full"
                  />
                </div>

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

                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Date of birth</label>
                  <button
                    ref={calendarButtonRef}
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                    className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 transition hover:border-slate-300"
                  >
                    <Calendar size={16} className="text-slate-400" />
                    <span className="flex-1 text-left">
                      {selectedDate
                        ? selectedDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Select date'}
                    </span>
                  </button>
                  <CalendarPopover
                    anchorRef={calendarButtonRef.current}
                    open={isCalendarOpen}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    onApply={() => {
                      if (selectedDate) {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        setFormData((prev) => ({ ...prev, dateOfBirth: dateStr }));
                      }
                      setIsCalendarOpen(false);
                    }}
                    onCancel={() => setIsCalendarOpen(false)}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">OTP Channel</label>
                  {modalRole === 'ADMIN' ? (
                    <div className="flex h-10 w-full items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                      Email (Auto-configured for Admin)
                    </div>
                  ) : (
                    <SmallDropdown
                      value={formData.otpChannel}
                      options={[
                        { value: 'sms' as OtpChannel, label: 'SMS' },
                        { value: 'email' as OtpChannel, label: 'Email' },
                      ]}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, otpChannel: value }))
                      }
                      ariaLabel="Select OTP channel"
                      widthClass="w-full"
                    />
                  )}
                </div>
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

                  {modalRole === 'ADMIN' && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-sm text-emerald-700">
                        <span className="font-medium">Admin Account:</span> This account will be
                        pre-verified and profile completion will be marked as done. No OTP
                        verification needed.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 text-base text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-900">Mode:</span> In system
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">User type:</span>{' '}
                      {formatUserType(modalRole)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Full name:</span>{' '}
                      {formData.fullName || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Gender:</span>{' '}
                      {formData.gender}
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
                      <span className="font-medium text-slate-900">Date of birth:</span>{' '}
                      {formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">OTP Channel:</span>{' '}
                      {modalRole === 'ADMIN'
                        ? 'Email (Auto)'
                        : formData.otpChannel.toUpperCase()}
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
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="secondary"
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleProceed}
                disabled={
                  isSubmitting ||
                  (step === 1 &&
                    (!formData.fullName ||
                      !formData.email ||
                      !formData.phoneNumber ||
                      !formData.dateOfBirth)) ||
                  (step === 2 && !isEditMode && !formData.password)
                }
              >
                Proceed
              </Button>
            ) : (
              <Button
                className="rounded-full px-4 py-2 text-xs font-medium"
                onClick={handleSave}
                disabled={
                  isSubmitting ||
                  authLoading ||
                  !formData.fullName ||
                  !formData.email ||
                  !formData.phoneNumber
                }
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}