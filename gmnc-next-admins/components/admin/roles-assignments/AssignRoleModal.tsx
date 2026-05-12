import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import RoleFilterDropdown from '@/components/admin/roles-access/RoleFilterDropdown';
import { AssignmentScopeType, AppRoleRecord } from '@/lib/api/types';
import CalendarPopover from "@/components/ui/CalendarPopover"
import { X } from 'lucide-react';


export interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, roleId: string) => Promise<void>;
  users: { id: string; fullName: string; email?: string; userType: string }[];
  roles: AppRoleRecord[];
  selectedRole: string;
  onChangeRole: (role: string) => void;
  selectedScope: AssignmentScopeType;
  onChangeScope: (scope: AssignmentScopeType) => void;
  selectedUserId: string;
  onChangeUserId: (userId: string) => void;
  selectedExpiryDate: Date | null;
  onChangeExpiryDate: (date: Date | null) => void;
}


export default function AssignRoleModal(props: AssignRoleModalProps) {
  const { 
    isOpen, 
    onClose, 
    onSave, 
    roles, 
    selectedRole, 
    onChangeRole, 
    selectedScope, 
    onChangeScope, 
    selectedUserId, 
    onChangeUserId,
    selectedExpiryDate,
    onChangeExpiryDate
  } = props;
  
  const [expiryDate, setExpiryDate] = useState<Date | null>(selectedExpiryDate);
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Assign role</h3>
            <p className="mt-1 text-sm text-slate-500">
              Assign a web role to a user with a selected scope.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">User</label>
            <RoleFilterDropdown
              value={selectedUserId}
              options={props.users
                .filter(user => user.userType !== 'CAREGIVER') // Exclude caregivers
                .map(user => ({
                  value: user.id,
                  label: `${user.fullName} (${user.email || 'No email'})`,
                }))}
              onChange={onChangeUserId}
              ariaLabel="Select user"
              widthClass="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Role</label>
            <RoleFilterDropdown
              value={selectedRole}
              options={roles.map((role) => ({
                value: role.slug,
                label: role.name,
              }))}
              onChange={onChangeRole}
              ariaLabel="Select role"
              widthClass="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Scope type</label>
            <RoleFilterDropdown
              value={selectedScope}
              options={[
                { value: 'GLOBAL', label: 'Global' },
                { value: 'ORGANIZATION', label: 'Organization' },
                { value: 'SERVICE_PROVIDER', label: 'Service provider' },
                { value: 'COMMUNITY', label: 'Community' },
              ]}
              onChange={(value) => onChangeScope(value as AssignmentScopeType)}
              ariaLabel="Select scope type"
              widthClass="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Expiry date</label>
            <div className="relative">
              <button
                ref={calendarButtonRef}
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="flex h-9 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:border-slate-300"
              >
                <span className="flex-1 text-left">
                  {expiryDate
                    ? expiryDate.toLocaleDateString(undefined, {
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
                 selected={expiryDate ?? undefined}
                 onSelect={(date) => setExpiryDate(date ?? null)}
                 onApply={() => {
                   setIsCalendarOpen(false);
                   onChangeExpiryDate(expiryDate);
                 }}
                 onCancel={() => setIsCalendarOpen(false)}
                 minWidth={120}
               />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="secondary"
            className="rounded-full px-4 py-2 text-xs font-medium"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full px-4 py-2 text-xs font-medium"
            onClick={() => onSave(selectedUserId, selectedRole)}
            disabled={!selectedUserId || !selectedRole}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
