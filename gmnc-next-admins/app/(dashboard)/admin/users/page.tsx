"use client";

import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  SearchIcon, 
  UserPlusIcon, 
  MoreVerticalIcon, 
  ShieldCheckIcon, 
  GhostIcon, 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Dr. Louisa Parker', email: 'louisa@example.com', roles: ['provider'], status: 'Active' },
  { id: 'USR-002', name: 'Admin User', email: 'admin@gmnc.com', roles: ['admin'], status: 'Active' },
  { id: 'USR-003', name: 'Tijani Dromo', email: 'tijani@care.com', roles: ['caregiver'], status: 'Active' },
  { id: 'USR-004', name: 'Inactive Tester', email: 'tester@test.com', roles: ['tester'], status: 'Deactivated' },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Manage system users, roles, and access states.</p>
          </div>
          <Button  
            className="gap-2 px-2 shadow-lg shadow-accent/20 rounded cursor-pointer"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlusIcon size={16} /> Add User
          </Button>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                placeholder="Search by name, email or ID..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <Table 
          title="System Users"
          data={MOCK_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))}
          columns={[
            { header: 'User', accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShieldCheckIcon size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.email}</p>
                </div>
              </div>
            )},
            { header: 'Roles', accessor: (item) => (
              <div className="flex gap-1">
                {item.roles.map(r => (
                  <Badge key={r} variant="outline" className="text-[9px] uppercase font-bold border-slate-100">{r}</Badge>
                ))}
              </div>
            )},
            { header: 'Status', accessor: (item) => (
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              )}>
                {item.status}
              </span>
            )},
          ]}
          actions={(item) => (
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-300 hover:text-accent hover:bg-accent/5 rounded-lg transition-all" title="Impersonate">
                  <GhostIcon size={18} />
               </button>
               <button 
                className="p-2 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                onClick={() => handleEditUser(item)}
              >
                  <MoreVerticalIcon size={18} />
               </button>
            </div>
          )}
        />
        {/* Add User Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add new user"
        >
          <div className="space-y-6">
            <p className="text-xs text-slate-400 font-medium">Create an account and assign a role. Permissions follow the role and can be fine-tuned.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <Input className="pl-11" placeholder="Jane Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <MailIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className="pl-11" placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone (optional)</label>
                  <div className="relative">
                    <PhoneIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className="pl-11" placeholder="+1 555 0100" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                <select className="w-full h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none appearance-none">
                  <option>Provider</option>
                  <option>Admin</option>
                  <option>Caregiver</option>
                </select>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Clinical access — patients, appointments, notes and prescriptions.</p>
              </div>

              <div className="flex items-center gap-2 p-1">
                <input type="checkbox" className="w-4 h-4 rounded border border-slate-200 text-brand focus:ring-brand" id="permissions" />
                <label htmlFor="permissions" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ShieldCheckIcon size={14} className="text-brand" /> Permissions
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-2xl py-6 bg-brand hover:bg-brand-hover text-white gap-2 shadow-lg shadow-brand/20">
                <UserPlusIcon size={18} /> Create user
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={selectedUser?.name || "Edit user"}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedUser?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Viewing user record</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit</span>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative p-1",
                    isEditing ? "bg-brand" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 bg-white rounded-full transition-all",
                    isEditing ? "ml-5" : "ml-0"
                  )} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full name</label>
                <Input disabled={!isEditing} defaultValue={selectedUser?.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                  <Input disabled={!isEditing} defaultValue={selectedUser?.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <select 
                    disabled={!isEditing} 
                    defaultValue={selectedUser?.roles[0]}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                  >
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>
              </div>
            </div>  

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => setIsEditModalOpen(false)}>Close</Button>
              {isEditing && (
                <Button className="flex-1 rounded-2xl py-6 bg-brand text-white gap-2 shadow-lg shadow-brand/20">
                   Save Changes
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
