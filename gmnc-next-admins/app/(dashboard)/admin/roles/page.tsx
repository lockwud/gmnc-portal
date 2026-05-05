"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ChevronDownIcon, 
  SearchIcon, 
  LockIcon,
  PlusIcon,
  RefreshCcwIcon,
  HelpCircleIcon,
  ArrowRightIcon,
  MoreVerticalIcon,
  ChevronRightIcon
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Color Palette for Brand Theme
const COLORS = {
  primary: '#059669', // Emerald 600
  primaryLight: '#ECFDF5',
  border: '#E2E8F0', // Slate 200
  textMain: '#1E293B',
  textMuted: '#64748B',
  bgMain: '#F8FAFC',
};

const ROLES = [
  { id: 'admin', name: 'System Administrator' },
  { id: 'clinical_director', name: 'Clinical Director' },
  { id: 'physician', name: 'Senior Physician' },
  { id: 'nurse_practitioner', name: 'Nurse Practitioner' },
  { id: 'receptionist', name: 'Front Desk Coordinator' },
  { id: 'billing_manager', name: 'Billing & Insurance Manager' },
  { id: 'it_support', name: 'IT Support Specialist' },
  { id: 'patient_advocate', name: 'Patient Advocate' },
];

const MODULE_CODES = [
  { code: 'PR', name: 'Patient Records' },
  { code: 'AP', name: 'Appointments' },
  { code: 'TH', name: 'Telehealth' },
  { code: 'CN', name: 'Clinical Notes' },
  { code: 'RX', name: 'Prescriptions' },
  { code: 'LB', name: 'Lab Results' },
  { code: 'BL', name: 'Billing' },
  { code: 'IV', name: 'Inventory' },
  { code: 'AU', name: 'Audit Logs' },
  { code: 'UM', name: 'User Management' },
  { code: 'SS', name: 'System Settings' },
  { code: 'RP', name: 'Reporting' },
  { code: 'NT', name: 'Notifications' },
  { code: 'MC', name: 'Messaging Center' },
];

const MODULES = [
  { id: 'patient_records', name: 'Patient Records (EMR)', category: 'Clinical' },
  { id: 'appointments', name: 'Appointments & Scheduling', category: 'Operational' },
  { id: 'telehealth', name: 'Telehealth Sessions', category: 'Clinical' },
  { id: 'clinical_notes', name: 'Clinical Notes & Charts', category: 'Clinical' },
  { id: 'prescriptions', name: 'Prescriptions & Medication', category: 'Clinical' },
  { id: 'lab_results', name: 'Lab Results & Imaging', category: 'Clinical' },
  { id: 'billing', name: 'Billing & Invoicing', category: 'Financial' },
  { id: 'insurance', name: 'Insurance Claims', category: 'Financial' },
  { id: 'inventory', name: 'Medical Supplies Inventory', category: 'Operational' },
];

const PERMISSIONS_DATA = {
  patient_records: [
    { id: 'view_emr', name: 'Can View Electronic Medical Records', desc: 'Allows the user to view comprehensive patient health histories.' },
    { id: 'edit_emr', name: 'Can Edit Medical Records', desc: 'Allows the user to update patient information and history.' },
    { id: 'export_emr', name: 'Can Export EMR Data', desc: 'Allows downloading patient records as PDF/CCD.' },
  ],
  appointments: [
    { id: 'view_schedule', name: 'Can View Clinical Schedule', desc: 'Allows the user to see the daily appointment calendar.' },
    { id: 'book_appt', name: 'Can Book New Appointments', desc: 'Allows creating new patient bookings and sessions.' },
    { id: 'cancel_appt', name: 'Can Cancel Appointments', desc: 'Allows removing or rescheduling patient visits.' },
  ],
  clinical_notes: [
    { id: 'write_notes', name: 'Can Write Clinical Notes', desc: 'Allows physicians to document patient encounters.' },
    { id: 'sign_off', name: 'Can Sign Off Charts', desc: 'Allows final approval and signing of clinical documentation.' },
  ],
};

export default function RoleManagementPage() {
  const [selectedRole, setSelectedRole] = useState<{ id: string, name: string } | null>(null);
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [activeCode, setActiveCode] = useState('PR'); // Default to Patient Records category
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({
    view_emr: true,
    book_appt: true,
  });

  // Filter modules based on the selected abbreviation code
  const filteredModules = useMemo(() => {
    const selectedCodeObj = MODULE_CODES.find(c => c.code === activeCode);
    if (!selectedCodeObj) return MODULES;
    
    // In a real app, you'd have a mapping. Here we'll match by category name or simple logic.
    const categoryMap: Record<string, string> = {
      'PR': 'Clinical',
      'AP': 'Operational',
      'TH': 'Clinical',
      'CN': 'Clinical',
      'RX': 'Clinical',
      'LB': 'Clinical',
      'BL': 'Financial',
      'IV': 'Operational',
      'AU': 'Operational',
      'UM': 'System',
      'SS': 'System',
      'RP': 'System',
    };
    
    const targetCategory = categoryMap[activeCode];
    return MODULES.filter(m => m.category === targetCategory);
  }, [activeCode]);

  // When activeCode changes, auto-select the first module in that category if the current one isn't there
  useEffect(() => {
    if (!filteredModules.find(m => m.id === activeModule.id) && filteredModules.length > 0) {
      setActiveModule(filteredModules[0]);
    }
  }, [activeCode, filteredModules]);

  const filteredRoles = ROLES.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePermission = (id: string) => {
    setPermissionStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPermissions = (PERMISSIONS_DATA as any)[activeModule.id] || [];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6 pb-10 max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Roles & Permissions
            </h1>
            <p className="text-slate-500 text-[14px]">
              Allows you to assign and manage access levels for different users within the system
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Role Selector Dropdown */}
             <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-[280px] flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-all shadow-sm group"
                >
                  <span className={cn("truncate", !selectedRole && "text-slate-400")}>
                    {selectedRole ? selectedRole.name : "Select a role..."}
                  </span>
                  <ChevronDownIcon size={18} className={cn("text-slate-400 transition-transform group-hover:text-slate-600", isDropdownOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute right-0 mt-2 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search roles..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {filteredRoles.map(role => (
                          <button
                            key={role.id}
                            onClick={() => {
                              setSelectedRole(role);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group",
                              selectedRole?.id === role.id 
                                ? "bg-brand text-white" 
                                : "text-slate-600 hover:bg-slate-50 hover:text-brand"
                            )}
                          >
                            {role.name}
                            {selectedRole?.id === role.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand gap-2 rounded-xl text-[13px] font-bold px-6 h-[44px] transition-all shadow-sm">
                <ShieldCheckIcon size={18} /> Manage Roles
             </Button>
          </div>
        </div>

        {!selectedRole ? (
          /* Empty State */
          <div className="bg-white rounded-[32px] p-20 flex flex-col items-center justify-center text-center space-y-6 min-h-[600px] shadow-sm">
            <div className="relative">
              <div className="w-64 h-64 bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative z-10"
                >
                  <div className="w-32 h-40 bg-white rounded-xl border-2 border-slate-100 shadow-xl flex flex-col p-4 space-y-3">
                    <div className="w-full h-2 bg-slate-100 rounded" />
                    <div className="w-2/3 h-2 bg-slate-50 rounded" />
                    <div className="flex-1 flex items-center justify-center">
                       <div className="w-12 h-12 bg-brand/5 rounded-full flex items-center justify-center">
                          <HelpCircleIcon size={24} className="text-brand/40" />
                       </div>
                    </div>
                  </div>
                </motion.div>
                {/* Decorative blobs */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-pink-100/30 rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-100/30 rounded-full blur-2xl" />
              </div>
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No role selected.</h3>
              <p className="text-slate-500">Please choose a role to manage its permissions.</p>
            </div>
            <Button 
              onClick={() => setIsDropdownOpen(true)}
              variant="outline" 
              className="border-slate-200 rounded-xl hover:bg-slate-50 transition-all px-8"
            >
              Select Role
            </Button>
          </div>
        ) : (
          /* Main Permissions Interface */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] shadow-sm overflow-hidden flex flex-col min-h-[700px]"
          >
            {/* Horizontal Module Codes Bar */}
            <div className="px-6 py-4 bg-slate-50/40 border-b border-slate-100">
               <div className="flex flex-wrap gap-2">
                  {MODULE_CODES.map((item, i) => (
                    <div 
                      key={i} 
                      title={item.name}
                      onClick={() => setActiveCode(item.code)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-sm",
                        activeCode === item.code ? "bg-white text-brand border-brand ring-2 ring-brand/10" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      )}
                    >
                      {item.code}
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Modules List */}
              <div className="w-[320px] border-r border-slate-100 bg-white flex flex-col overflow-hidden">
                <div className="p-6 pb-2">
                   <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-6">Modules</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-4 space-y-1.5 pb-6">
                   {filteredModules.map(module => (
                     <button
                       key={module.id}
                       onClick={() => setActiveModule(module)}
                       className={cn(
                         "w-full text-left px-5 py-4 rounded-2xl text-[14px] font-semibold transition-all flex items-center justify-between group relative overflow-hidden",
                        activeModule.id === module.id 
                           ? "bg-slate-50 text-slate-900 border-l-4 border-brand rounded-r-none" 
                           : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                       )}
                     >
                       <span className="relative z-10">{module.name}</span>
                       <ChevronRightIcon size={16} className={cn("relative z-10 transition-transform", activeModule.id === module.id ? "rotate-0 text-brand" : "opacity-0 group-hover:opacity-100")} />
                       {activeModule.id === module.id && (
                         <motion.div 
                            layoutId="activeModuleBg"
                            className="absolute inset-0 bg-slate-50/50"
                         />
                       )}
                     </button>
                   ))}
                   {filteredModules.length === 0 && (
                     <div className="p-10 text-center">
                        <p className="text-xs text-slate-400">No modules in this category.</p>
                     </div>
                   )}
                </div>
              </div>

              {/* Right Content - Permissions Table */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Module Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeModule.name}</h2>
                    <p className="text-[14px] text-slate-500 mt-1">Manage permissions for the {activeModule.name} module.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-2xl">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                       <LockIcon size={14} className="text-slate-400" />
                       <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out",
                          true ? "bg-brand" : "bg-slate-200"
                        )}
                      >
                        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", true ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50 bg-slate-50/20">
                          <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] w-[30%]">Modules</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Items</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] text-right">Access</th>
                       </tr>
                    </thead>
                    <tbody>
                       {currentPermissions.map((perm: any) => (
                         <tr key={perm.id} className="group border-b border-slate-50/50 hover:bg-slate-50/30 transition-all">
                            <td className="px-8 py-8 align-top">
                               <div className="p-1 bg-slate-50 rounded-xl inline-block border border-slate-100">
                                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                     {activeModule.name}
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-8">
                               <div className="space-y-1">
                                  <p className="text-[15px] font-bold text-slate-900 leading-none">{perm.name}</p>
                                  <p className="text-[13px] text-slate-400 leading-relaxed max-w-md">{perm.desc}</p>
                               </div>
                            </td>
                            <td className="px-8 py-8">
                               <div className="flex justify-end">
                                  <button 
                                    onClick={() => togglePermission(perm.id)}
                                    className={cn(
                                      "w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out",
                                      permissionStates[perm.id] ? "bg-brand" : "bg-slate-200"
                                    )}
                                  >
                                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", permissionStates[perm.id] ? "translate-x-6" : "translate-x-0")} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {currentPermissions.length === 0 && (
                         <tr>
                            <td colSpan={3} className="p-24 text-center">
                               <div className="flex flex-col items-center gap-4">
                                  <div className="p-6 bg-slate-50 rounded-3xl text-slate-300">
                                     <LockIcon size={48} />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-lg font-bold text-slate-800">No detailed permissions</p>
                                    <p className="text-[14px] text-slate-400">There are no specific toggle items for this module yet.</p>
                                  </div>
                               </div>
                            </td>
                         </tr>
                       )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="p-6 px-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-6">
               <button className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-4 rounded-xl hover:bg-white hover:shadow-sm">
                  <RefreshCcwIcon size={16} /> Reset Changes
               </button>
               <button className="text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors py-2 px-4">
                  Cancel
               </button>
               <button className="bg-brand text-white px-10 py-3.5 rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Apply Changes
               </button>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
