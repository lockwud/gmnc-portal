"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  Search, 
  Lock,
  Plus,
  RefreshCcw,
  HelpCircle,
  ChevronRight,
  Settings,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'admin', name: 'System Administrator', userCount: 3, description: 'Full access to all modules and system settings.' },
  { id: 'clinical_director', name: 'Clinical Director', userCount: 2, description: 'Oversees medical operations and high-level patient data.' },
  { id: 'physician', name: 'Senior Physician', userCount: 12, description: 'Clinical access to patients, prescriptions, and notes.' },
  { id: 'nurse_practitioner', name: 'Nurse Practitioner', userCount: 8, description: 'Support clinical tasks and patient monitoring.' },
  { id: 'billing_manager', name: 'Billing Manager', userCount: 2, description: 'Handles invoices, insurance claims, and payments.' },
];

const MODULE_CODES = [
  { code: 'PR', name: 'Patient Records', category: 'Clinical' },
  { code: 'AP', name: 'Appointments', category: 'Operational' },
  { code: 'TH', name: 'Telehealth', category: 'Clinical' },
  { code: 'CN', name: 'Clinical Notes', category: 'Clinical' },
  { code: 'RX', name: 'Prescriptions', category: 'Clinical' },
  { code: 'BL', name: 'Billing', category: 'Financial' },
  { code: 'UM', name: 'User Management', category: 'System' },
  { code: 'SS', name: 'System Settings', category: 'System' },
];

const PERMISSIONS_DATA = {
  PR: [
    { id: 'view_emr', name: 'View Medical Records', desc: 'Allows viewing comprehensive patient health histories.' },
    { id: 'edit_emr', name: 'Edit Medical Records', desc: 'Allows updating patient information and history.' },
    { id: 'export_emr', name: 'Export EMR Data', desc: 'Allows downloading patient records as PDF/CCD.' },
  ],
  AP: [
    { id: 'view_schedule', name: 'View Schedule', desc: 'Allows seeing the daily clinical calendar.' },
    { id: 'book_appt', name: 'Book Appointments', desc: 'Allows creating new patient bookings.' },
    { id: 'cancel_appt', name: 'Cancel Appointments', desc: 'Allows removing or rescheduling visits.' },
  ],
  CN: [
    { id: 'write_notes', name: 'Write Notes', desc: 'Allows documenting patient encounters.' },
    { id: 'sign_off', name: 'Sign Off Charts', desc: 'Allows final approval of clinical documentation.' },
  ],
};

export function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [activeCode, setActiveCode] = useState('PR');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({
    view_emr: true,
    book_appt: true,
    write_notes: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const togglePermission = (id: string) => {
    setPermissionStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPermissions = (PERMISSIONS_DATA as any)[activeCode] || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Define system roles and fine-tune their access across clinical and operational modules.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            className="h-12 gap-2 px-6 shadow-xl shadow-brand/20 rounded-2xl bg-brand hover:bg-brand-hover text-white border-none font-bold transition-all"
            onClick={() => setIsRoleModalOpen(true)}
          >
            <Plus size={18} /> 
            Create New Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Roles List */}
        <div className="xl:col-span-1 space-y-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Available Roles</h3>
           <div className="space-y-2">
             {ROLES.map((role) => (
               <button
                 key={role.id}
                 onClick={() => setSelectedRole(role)}
                 className={cn(
                   "w-full text-left p-5 rounded-[24px] border transition-all flex flex-col gap-2 relative overflow-hidden group",
                   selectedRole.id === role.id 
                    ? "bg-white border-emerald-200 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/5" 
                    : "bg-slate-50/50 border-transparent hover:border-slate-200"
                 )}
               >
                 {selectedRole.id === role.id && (
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                 )}
                 <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold tracking-tight", selectedRole.id === role.id ? "text-slate-900" : "text-slate-600")}>
                      {role.name}
                    </span>
                    <Badge color="gray" className="bg-white border-slate-100 text-[10px] font-bold">
                      {role.userCount} Users
                    </Badge>
                 </div>
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-1">{role.description}</p>
               </button>
             ))}
           </div>
        </div>

        {/* Permissions Editor */}
        <div className="xl:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[650px]">
          {/* Editor Header */}
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
               <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  Editing Permissions for <span className="text-emerald-600">{selectedRole.name}</span>
               </h2>
               <p className="text-xs text-slate-500 font-medium mt-1">Changes applied here will affect all users assigned to this role.</p>
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={handleEditClick}
                  className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm"
               >
                  <Settings size={20} />
               </button>
                <button 
                  onClick={() => toast.success('Role deletion requested')}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                   <Trash2 size={20} />
                </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
             {/* Module Navigation */}
             <div className="w-full md:w-[240px] border-r border-slate-50 bg-white p-4 space-y-1 overflow-y-auto">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Functional Modules</h4>
                {MODULE_CODES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setActiveCode(item.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all",
                      activeCode === item.code 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <div className={cn("w-2 h-2 rounded-full", activeCode === item.code ? "bg-emerald-500" : "bg-slate-200")} />
                       {item.name}
                    </div>
                    <ChevronRight size={14} className={cn("transition-transform", activeCode === item.code ? "rotate-0" : "-rotate-90 opacity-0")} />
                  </button>
                ))}
             </div>

             {/* Permission Toggles */}
             <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                        {MODULE_CODES.find(c => c.code === activeCode)?.name} Access
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Fine-tune specific actions allowed within this module.</p>
                   </div>
                   <Badge color="gray" className="bg-slate-50 border-none font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
                      Module: {activeCode}
                   </Badge>
                </div>

                <div className="space-y-4">
                  {currentPermissions.length > 0 ? (
                    currentPermissions.map((perm: any) => (
                      <div 
                        key={perm.id} 
                        className={cn(
                          "flex items-center justify-between p-6 rounded-3xl border transition-all",
                          permissionStates[perm.id] ? "bg-white border-emerald-100 shadow-sm" : "bg-slate-50/50 border-slate-100"
                        )}
                      >
                        <div className="flex-1 pr-8">
                           <div className="flex items-center gap-2 mb-1">
                              <p className="text-[15px] font-bold text-slate-900 leading-none tracking-tight">{perm.name}</p>
                              {permissionStates[perm.id] && <Badge color="green" className="text-[8px] h-4 px-1.5 font-black uppercase">Active</Badge>}
                           </div>
                           <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{perm.desc}</p>
                        </div>
                        <button 
                          onClick={() => {
                            togglePermission(perm.id);
                            toast.success(`Permission ${perm.name} ${!permissionStates[perm.id] ? 'enabled' : 'disabled'}`);
                          }}
                          className={cn(
                            "w-14 h-7 rounded-full relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                            permissionStates[perm.id] ? "bg-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
                          )}
                        >
                          <motion.div 
                            animate={{ x: permissionStates[perm.id] ? 28 : 4 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" 
                          />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                          <Lock size={32} className="text-slate-200" />
                       </div>
                       <h4 className="text-lg font-bold text-slate-900">Module Locked or Empty</h4>
                       <p className="text-sm text-slate-400 max-w-[280px] font-medium mx-auto mt-2">
                         No specific permissions have been defined for the {activeCode} module yet.
                       </p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="px-8 py-6 border-t border-slate-50 bg-white flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-xs font-bold text-slate-900">Read Access</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <span className="text-xs font-bold text-slate-900">Write Access</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Button 
                  variant="gray" 
                  className="h-12 rounded-2xl font-bold text-slate-400 gap-2"
                  onClick={() => toast.success('Changes reset to last saved state')}
                >
                   <RefreshCcw size={18} />
                   Reset Changes
                </Button>
                <Button 
                  className="h-12 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white border-none px-10 shadow-xl shadow-slate-900/10"
                  onClick={() => toast.success("Permissions updated successfully!")}
                >
                   Save Role Permissions
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Create Custom System Role"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-medium px-1 leading-relaxed">
            Roles represent job functions and contain a predefined set of permissions. You can clone an existing role to start faster.
          </p>
          
          <div className="space-y-4">
            <FormField label="Role Name" required>
              <Input placeholder="e.g. Clinical Pharmacist" className="h-12 rounded-2xl bg-slate-50/50" />
            </FormField>
            <FormField label="Role Description">
              <textarea 
                placeholder="Describe the responsibilities associated with this role..."
                className="w-full min-h-[100px] p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white outline-none transition-all"
              />
            </FormField>
            <div className="p-5 bg-amber-50 rounded-[24px] border border-amber-100 flex gap-4">
               <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
               <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Warning:</strong> Creating a new role requires assigning permissions manually across all modules after creation.
               </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="gray" className="flex-1 h-14 rounded-2xl font-bold border border-slate-100" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 h-14 rounded-2xl font-bold bg-brand hover:bg-brand-hover text-white border-none shadow-xl shadow-brand/20"
              onClick={() => {
                setIsRoleModalOpen(false);
                toast.success('Custom role created successfully!');
              }}
            >
              Create Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Role Metadata"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-medium px-1">
            Update the descriptive details for <span className="font-bold text-slate-900">{selectedRole.name}</span>.
          </p>
          
          <div className="space-y-4">
            <FormField label="Role Name" required>
              <Input defaultValue={selectedRole.name} className="h-12 rounded-2xl bg-slate-50/50" />
            </FormField>
            <FormField label="Role Description">
              <textarea 
                defaultValue={selectedRole.description}
                className="w-full min-h-[100px] p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white outline-none transition-all"
              />
            </FormField>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="gray" className="flex-1 h-14 rounded-2xl font-bold border border-slate-100" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 h-14 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white border-none shadow-xl shadow-slate-900/10"
              onClick={() => { toast.success("Role metadata updated!"); setIsEditModalOpen(false); }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
