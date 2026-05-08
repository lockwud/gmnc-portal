"use client";

import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
  UserPlusIcon, 
  MoreVerticalIcon, 
  ShieldCheckIcon, 
  GhostIcon, 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  Trash2,
  Edit2,
  ExternalLink
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Dr. Louisa Parker', email: 'louisa@example.com', roles: ['provider'], status: 'Active', phone: '+233 24 555 0101' },
  { id: 'USR-002', name: 'Admin User', email: 'admin@gmnc.com', roles: ['admin'], status: 'Active', phone: '+233 20 111 2222' },
  { id: 'USR-003', name: 'Tijani Dromo', email: 'tijani@care.com', roles: ['caregiver'], status: 'Active', phone: '+233 55 999 8888' },
  { id: 'USR-004', name: 'Inactive Tester', email: 'tester@test.com', roles: ['tester'], status: 'Deactivated', phone: '+233 27 333 4444' },
];

export function UserManagement() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    toast.success(`User ${userToDelete.name} has been deleted.`);
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("User created successfully!");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete User"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Control system access, assign roles, and monitor user activity.</p>
        </div>
        <Button  
          className="h-8 gap-2 px-2 shadow-xl shadow-brand/20 rounded bg-brand hover:bg-brand-hover text-white border-none font-bold transition-all"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlusIcon size={18} /> 
          Add New User
        </Button>
      </div>

      {/* Filters & Actions */}
        <div className="flex items-center gap-2">
            <Button 
              variant="gray" 
              className="h-11 rounded-xl font-bold border border-slate-100 bg-white"
              onClick={() => toast.success('Users list exported to CSV')}
            >
               Export CSV
            </Button>
        </div>

      {/* Users Table */}
      <div>
        <Table 
          data={MOCK_USERS}
          columns={[
            { header: 'User', accessor: (item) => (
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 tracking-tight">{item.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                </div>
              </div>
            )},
            { header: 'ID', accessor: (item) => (
              <span className="text-xs font-mono font-bold text-slate-400">{item.id}</span>
            )},
            { header: 'Roles', accessor: (item) => (
              <div className="flex gap-1.5">
                {item.roles.map(r => (
                  <Badge key={r} variant={r === 'admin' ? 'rose' : r === 'provider' ? 'blue' : 'emerald'} className="text-[10px] uppercase font-bold">
                    {r}
                  </Badge>
                ))}
              </div>
            )},
            { header: 'Status', accessor: (item) => (
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", item.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300')} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  item.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                )}>
                  {item.status}
                </span>
              </div>
            )},
          ]}
          actions={(item) => (
            <div className="flex items-center justify-end gap-1">
               <button 
                  onClick={() => router.push(`/admin/users/${item.id}`)}
                  className="p-2.5 text-slate-400 hover:text-brand hover:bg-emerald-50 rounded-xl transition-all" 
                  title="View Details"
               >
                  <ExternalLink size={18} />
               </button>
               <button 
                  onClick={() => handleEditClick(item)}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                  title="Edit User"
               >
                  <Edit2 size={18} />
               </button>
                <button 
                   onClick={() => toast.success(`Impersonating ${item.name}...`)}
                   className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                   title="Impersonate"
                >
                   <GhostIcon size={18} />
                </button>
               <button 
                  onClick={() => handleDeleteClick(item)}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                  title="Delete User"
               >
                  <Trash2 size={18} />
               </button>
            </div>
          )}
        />
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          <p className="text-sm text-slate-500 font-medium px-1">
            Fill in the details below to create a new user and assign their primary role.
          </p>
          
          <div className="space-y-4">
            <FormField label="Full Name" required>
              <div className="relative">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-11 h-12" placeholder="e.g. John Doe" required />
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email Address" required>
                <div className="relative">
                  <MailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="email" className="pl-11 h-12" placeholder="john@example.com" required />
                </div>
              </FormField>
              <FormField label="Phone Number">
                <div className="relative">
                  <PhoneIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11 h-12" placeholder="+233 24 000 0000" />
                </div>
              </FormField>
            </div>

            <Select 
              label="Primary Role" 
              required
              description="Determines the default dashboard and permission set."
              options={[
                { label: 'Provider (Doctor/Therapist)', value: 'provider' },
                { label: 'Administrator', value: 'admin' },
                { label: 'Caregiver / Parent', value: 'caregiver' },
                { label: 'Support Staff', value: 'support' },
                { label: 'Infrastructure Tester', value: 'tester' },
              ]}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              variant="gray" 
              className="flex-1 h-14 rounded-2xl font-bold border border-slate-100" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-14 rounded-2xl font-bold bg-brand hover:bg-brand-hover text-white border-none gap-2 shadow-xl shadow-brand/20"
            >
              <UserPlusIcon size={18} /> 
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Account"
      >
        <form onSubmit={(e) => { e.preventDefault(); toast.success("User updated!"); setIsEditModalOpen(false); }} className="space-y-6">
          <p className="text-sm text-slate-500 font-medium px-1">
            Update the information for <span className="font-bold text-slate-900">{selectedUser?.name}</span>.
          </p>
          
          <div className="space-y-4">
            <FormField label="Full Name" required>
              <div className="relative">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-11 h-12" defaultValue={selectedUser?.name} required />
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email Address" required>
                <div className="relative">
                  <MailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="email" className="pl-11 h-12" defaultValue={selectedUser?.email} required />
                </div>
              </FormField>
              <FormField label="Phone Number">
                <div className="relative">
                  <PhoneIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11 h-12" defaultValue={selectedUser?.phone} />
                </div>
              </FormField>
            </div>

            <Select 
              label="Primary Role" 
              required
              defaultValue={selectedUser?.roles[0]}
              options={[
                { label: 'Provider (Doctor/Therapist)', value: 'provider' },
                { label: 'Administrator', value: 'admin' },
                { label: 'Caregiver / Parent', value: 'caregiver' },
                { label: 'Support Staff', value: 'support' },
                { label: 'Infrastructure Tester', value: 'tester' },
              ]}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              variant="gray" 
              className="flex-1 h-14 rounded-2xl font-bold border border-slate-100" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-14 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white border-none gap-2 shadow-xl shadow-slate-900/10"
            >
              <Edit2 size={18} /> 
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
