// "use client";

// import React, { useState, useMemo } from "react";
// import { ShieldCheckIcon, ChevronDownIcon, SearchIcon, LockIcon, RefreshCcwIcon, HelpCircleIcon, ChevronRightIcon } from "lucide-react";
// import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// import Button from "@/components/ui/Button";
// import { motion, AnimatePresence } from "framer-motion";
// import { cn } from "@/lib/utils";

// const ROLES = [
//   { id: "admin", name: "System Administrator" },
//   { id: "clinical_director", name: "Clinical Director" },
//   { id: "physician", name: "Senior Physician" },
//   { id: "nurse_practitioner", name: "Nurse Practitioner" },
//   { id: "receptionist", name: "Front Desk Coordinator" },
//   { id: "billing_manager", name: "Billing & Insurance Manager" },
//   { id: "it_support", name: "IT Support Specialist" },
//   { id: "patient_advocate", name: "Patient Advocate" },
// ];

// const MODULE_CODES = [
//   { code: "PR", name: "Patient Records" },
//   { code: "AP", name: "Appointments" },
//   { code: "TH", name: "Telehealth" },
//   { code: "CN", name: "Clinical Notes" },
//   { code: "RX", name: "Prescriptions" },
//   { code: "LB", name: "Lab Results" },
//   { code: "BL", name: "Billing" },
//   { code: "IV", name: "Inventory" },
//   { code: "AU", name: "Audit Logs" },
//   { code: "UM", name: "User Management" },
//   { code: "SS", name: "System Settings" },
//   { code: "RP", name: "Reporting" },
//   { code: "NT", name: "Notifications" },
//   { code: "MC", name: "Messaging Center" },
// ];

// const MODULES = [
//   { id: "patient_records", name: "Patient Records (EMR)", category: "Clinical" },
//   { id: "appointments", name: "Appointments & Scheduling", category: "Operational" },
//   { id: "telehealth", name: "Telehealth Sessions", category: "Clinical" },
//   { id: "clinical_notes", name: "Clinical Notes & Charts", category: "Clinical" },
//   { id: "prescriptions", name: "Prescriptions & Medication", category: "Clinical" },
//   { id: "lab_results", name: "Lab Results & Imaging", category: "Clinical" },
//   { id: "billing", name: "Billing & Invoicing", category: "Financial" },
//   { id: "insurance", name: "Insurance Claims", category: "Financial" },
//   { id: "inventory", name: "Medical Supplies Inventory", category: "Operational" },
// ];

// const PERMISSIONS_DATA: Record<string, Array<{ id: string; name: string; desc: string }>> = {
//   patient_records: [
//     { id: "view_emr", name: "Can View Electronic Medical Records", desc: "Allows the user to view comprehensive patient health histories." },
//     { id: "edit_emr", name: "Can Edit Medical Records", desc: "Allows the user to update patient information and history." },
//     { id: "export_emr", name: "Can Export EMR Data", desc: "Allows downloading patient records as PDF/CCD." },
//   ],
//   appointments: [
//     { id: "view_schedule", name: "Can View Clinical Schedule", desc: "Allows the user to see the daily appointment calendar." },
//     { id: "book_appt", name: "Can Book New Appointments", desc: "Allows creating new patient bookings and sessions." },
//     { id: "cancel_appt", name: "Can Cancel Appointments", desc: "Allows removing or rescheduling patient visits." },
//   ],
//   clinical_notes: [
//     { id: "write_notes", name: "Can Write Clinical Notes", desc: "Allows physicians to document patient encounters." },
//     { id: "sign_off", name: "Can Sign Off Charts", desc: "Allows final approval and signing of clinical documentation." },
//   ],
// };

// type RoleRecord = { id: string; name: string };

// export default function RolesPage() {
//   const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
//   const [activeModuleId, setActiveModuleId] = useState(MODULES[0].id);
//   const [activeCode, setActiveCode] = useState("PR");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({ view_emr: true, book_appt: true });

//   const filteredModules = useMemo(() => {
//     const categoryMap: Record<string, string> = {
//       PR: "Clinical",
//       AP: "Operational",
//       TH: "Clinical",
//       CN: "Clinical",
//       RX: "Clinical",
//       LB: "Clinical",
//       BL: "Financial",
//       IV: "Operational",
//       AU: "Operational",
//       UM: "System",
//       SS: "System",
//       RP: "System",
//     };

//     const targetCategory = categoryMap[activeCode];
//     return targetCategory ? MODULES.filter((module) => module.category === targetCategory) : MODULES;
//   }, [activeCode]);

//   const filteredRoles = ROLES.filter((role) => role.name.toLowerCase().includes(searchQuery.toLowerCase()));

//   const activeModule = useMemo(
//     () => filteredModules.find((module) => module.id === activeModuleId) || filteredModules[0] || MODULES[0],
//     [activeModuleId, filteredModules]
//   );

//   const togglePermission = (id: string) => {
//     setPermissionStates((current) => ({ ...current, [id]: !current[id] }));
//   };

//   const currentPermissions = PERMISSIONS_DATA[activeModule.id] || [];

//   return (
//     <ProtectedRoute requiredRole="admin">
//       <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-10 sm:px-6">
//         <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
//           <div className="space-y-1">
//             <h1 className="flex items-center gap-3 text-[28px] font-bold tracking-tight text-slate-900">Roles & Permissions</h1>
//             <p className="text-[14px] text-slate-500">Allows you to assign and manage access levels for different users within the system</p>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <button
//                 onClick={() => setIsDropdownOpen((current) => !current)}
//                 className="group flex w-[280px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300"
//               >
//                 <span className={cn("truncate", !selectedRole && "text-slate-400")}>{selectedRole ? selectedRole.name : "Select a role..."}</span>
//                 <ChevronDownIcon size={18} className={cn("text-slate-400 transition-transform group-hover:text-slate-600", isDropdownOpen && "rotate-180")} />
//               </button>

//               <AnimatePresence>
//                 {isDropdownOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.98 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.98 }}
//                     className="absolute right-0 z-50 mt-2 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//                   >
//                     <div className="border-b border-slate-50 bg-slate-50/30 p-3">
//                       <div className="relative">
//                         <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                         <input
//                           type="text"
//                           placeholder="Search roles..."
//                           value={searchQuery}
//                           onChange={(event) => setSearchQuery(event.target.value)}
//                           className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/5"
//                           onClick={(event) => event.stopPropagation()}
//                         />
//                       </div>
//                     </div>
//                     <div className="max-h-[320px] overflow-y-auto p-2">
//                       {filteredRoles.map((role) => (
//                         <button
//                           key={role.id}
//                           onClick={() => {
//                             setSelectedRole(role);
//                             setIsDropdownOpen(false);
//                           }}
//                           className={cn(
//                             "group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-[13px] font-medium transition-all",
//                             selectedRole?.id === role.id ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50 hover:text-brand"
//                           )}
//                         >
//                           {role.name}
//                           {selectedRole?.id === role.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
//                         </button>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <Button variant="outline" className="h-[44px] gap-2 rounded-xl border-slate-200 px-6 text-[13px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-brand">
//               <ShieldCheckIcon size={18} /> Manage Roles
//             </Button>
//           </div>
//         </div>

//         {!selectedRole ? (
//           <div className="flex min-h-[600px] flex-col items-center justify-center space-y-6 rounded-[32px] bg-white p-20 text-center shadow-sm">
//             <div className="relative">
//               <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-full bg-slate-50">
//                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
//                   <div className="flex h-40 w-32 flex-col space-y-3 rounded-xl border-2 border-slate-100 bg-white p-4 shadow-xl">
//                     <div className="h-2 w-full rounded bg-slate-100" />
//                     <div className="h-2 w-2/3 rounded bg-slate-50" />
//                     <div className="flex flex-1 items-center justify-center">
//                       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/5">
//                         <HelpCircleIcon size={24} className="text-brand/40" />
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//                 <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-pink-100/30 blur-2xl" />
//                 <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-blue-100/30 blur-2xl" />
//               </div>
//             </div>
//             <div className="max-w-md space-y-2">
//               <h3 className="text-xl font-bold text-slate-800">No role selected.</h3>
//               <p className="text-slate-500">Please choose a role to manage its permissions.</p>
//             </div>
//             <Button onClick={() => setIsDropdownOpen(true)} variant="outline" className="rounded-xl border-slate-200 px-8 transition-all hover:bg-slate-50">
//               Select Role
//             </Button>
//           </div>
//         ) : (
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[700px] flex-col overflow-hidden rounded-[32px] bg-white shadow-sm">
//             <div className="border-b border-slate-100 bg-slate-50/40 px-6 py-4">
//               <div className="flex flex-wrap gap-2">
//                 {MODULE_CODES.map((item) => (
//                   <div
//                     key={item.code}
//                     title={item.name}
//                     onClick={() => setActiveCode(item.code)}
//                     className={cn(
//                       "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border text-[11px] font-bold shadow-sm transition-all",
//                       activeCode === item.code ? "border-brand bg-white text-brand ring-2 ring-brand/10" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
//                     )}
//                   >
//                     {item.code}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex flex-1 overflow-hidden">
//               <div className="flex w-[320px] flex-col overflow-hidden border-r border-slate-100 bg-white">
//                 <div className="p-6 pb-2">
//                   <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[2px] text-slate-400">Modules</h3>
//                 </div>
//                 <div className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
//                   {filteredModules.map((module) => (
//                     <button
//                       key={module.id}
//                       onClick={() => setActiveModuleId(module.id)}
//                       className={cn(
//                         "group relative flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-4 text-left text-[14px] font-semibold transition-all",
//                         activeModule.id === module.id ? "rounded-r-none border-l-4 border-brand bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                       )}
//                     >
//                       <span className="relative z-10">{module.name}</span>
//                       <ChevronRightIcon size={16} className={cn("relative z-10 transition-transform", activeModule.id === module.id ? "text-brand" : "opacity-0 group-hover:opacity-100")} />
//                       {activeModule.id === module.id && <motion.div layoutId="activeModuleBg" className="absolute inset-0 bg-slate-50/50" />}
//                     </button>
//                   ))}
//                   {filteredModules.length === 0 && (
//                     <div className="p-10 text-center">
//                       <p className="text-xs text-slate-400">No modules in this category.</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex flex-1 flex-col overflow-hidden bg-white">
//                 <div className="flex items-center justify-between border-b border-slate-50 bg-white p-8">
//                   <div>
//                     <h2 className="text-2xl font-bold text-slate-900">{activeModule.name}</h2>
//                     <p className="mt-1 text-[14px] text-slate-500">Manage permissions for the {activeModule.name} module.</p>
//                   </div>
//                   <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-2 pr-4">
//                     <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
//                       <LockIcon size={14} className="text-slate-400" />
//                       <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700">Access</span>
//                     </div>
//                     <button aria-label="Toggle module access" className="relative h-6 w-12 rounded-full bg-brand transition-all duration-300 ease-in-out">
//                       <div className="absolute left-1 top-1 h-4 w-4 translate-x-6 rounded-full bg-white shadow-md transition-transform duration-300" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto">
//                   <table className="w-full text-left">
//                     <thead>
//                       <tr className="border-b border-slate-50 bg-slate-50/20">
//                         <th className="w-[30%] px-8 py-5 text-[11px] font-bold uppercase tracking-[2px] text-slate-400">Modules</th>
//                         <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[2px] text-slate-400">Items</th>
//                         <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-[2px] text-slate-400">Access</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentPermissions.map((permission) => (
//                         <tr key={permission.id} className="group border-b border-slate-50/50 transition-all hover:bg-slate-50/30">
//                           <td className="px-8 py-8 align-top">
//                             <div className="inline-block rounded-xl border border-slate-100 bg-slate-50 p-1">
//                               <div className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                                 {activeModule.name}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-8 py-8">
//                             <div className="space-y-1">
//                               <p className="text-[15px] font-bold leading-none text-slate-900">{permission.name}</p>
//                               <p className="max-w-md text-[13px] leading-relaxed text-slate-400">{permission.desc}</p>
//                             </div>
//                           </td>
//                           <td className="px-8 py-8">
//                             <div className="flex justify-end">
//                               <button
//                                 aria-label={`Toggle ${permission.name}`}
//                                 onClick={() => togglePermission(permission.id)}
//                                 className={cn(
//                                   "relative h-6 w-12 rounded-full transition-all duration-300 ease-in-out",
//                                   permissionStates[permission.id] ? "bg-brand" : "bg-slate-200"
//                                 )}
//                               >
//                                 <div className={cn("absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300", permissionStates[permission.id] ? "translate-x-6" : "translate-x-0")} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                       {currentPermissions.length === 0 && (
//                         <tr>
//                           <td colSpan={3} className="p-24 text-center">
//                             <div className="flex flex-col items-center gap-4">
//                               <div className="rounded-3xl bg-slate-50 p-6 text-slate-300">
//                                 <LockIcon size={48} />
//                               </div>
//                               <div className="space-y-1">
//                                 <p className="text-lg font-bold text-slate-800">No detailed permissions</p>
//                                 <p className="text-[14px] text-slate-400">There are no specific toggle items for this module yet.</p>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-6 border-t border-slate-100 bg-slate-50/50 p-6 px-10">
//               <button className="flex rounded-xl px-4 py-2 text-[13px] font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-800 hover:shadow-sm">
//                 <RefreshCcwIcon size={16} />
//                 <span className="ml-2">Reset Changes</span>
//               </button>
//               <button className="px-4 py-2 text-[13px] font-bold text-slate-400 transition-colors hover:text-slate-600">Cancel</button>
//               <button className="rounded-2xl bg-brand px-10 py-3.5 text-[13px] font-bold uppercase tracking-widest text-white shadow-xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
//                 Apply Changes
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// }
