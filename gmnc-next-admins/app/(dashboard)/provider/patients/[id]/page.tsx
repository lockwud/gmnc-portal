"use client";

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  Clipboard, 
  Pill, 
  Stethoscope, 
  Calendar, 
  Plus, 
  Download, 
  Share2,
  AlertCircle,
  Thermometer,
  Wind,
  Heart,
  Droplets,
  Edit,
  History,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'summary', name: 'Clinical Summary', icon: Activity },
  { id: 'notes', name: 'Clinical Notes', icon: FileText },
  { id: 'prescriptions', name: 'Prescriptions', icon: Pill },
  { id: 'lab', name: 'Lab & Imaging', icon: Clipboard },
  { id: 'history', name: 'History', icon: History },
];

export default function PatientRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <ProtectedRoute requiredRole="provider">
      <div className="max-w-[1600px] mx-auto pb-20">
        {/* Patient Header Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm mb-8">
           <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <button 
                  onClick={() => router.back()}
                  className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
                 >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                 </button>
                 <div className="w-20 h-20 rounded-[28px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden ring-1 ring-slate-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kojo Mensah</h1>
                       <Badge color="green" className="font-bold px-3">ACTIVE CARE</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">ID: {id}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">MALE, 45Y</span>
                       <div className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">O+ BLOOD</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                 <Button variant="gray" className="h-12 rounded-2xl font-bold border border-slate-100 bg-white gap-2">
                    <Download size={18} />
                    Export EMR
                 </Button>
                 <Button variant="gray" className="h-12 rounded-2xl font-bold border border-slate-100 bg-white gap-2">
                    <Share2 size={18} />
                    Refer Patient
                 </Button>
                 <Button className="h-12 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-2 px-8 shadow-xl shadow-emerald-500/20">
                    <Plus size={18} />
                    New Encounter
                 </Button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
           {/* Navigation Tabs */}
           <div className="xl:col-span-1 space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-[24px] border transition-all relative group",
                      activeTab === tab.id 
                        ? "bg-white border-emerald-200 shadow-lg shadow-emerald-500/5" 
                        : "bg-slate-50/50 border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-400 group-hover:text-slate-600"
                    )}>
                       <Icon size={20} />
                    </div>
                    <span className={cn("text-sm font-bold tracking-tight", activeTab === tab.id ? "text-slate-900" : "text-slate-500")}>
                      {tab.name}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
              
              <div className="mt-12 p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                 <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Allergies & Alerts
                 </h4>
                 <div className="space-y-2">
                    <Badge color="red" className="w-full justify-start h-9 rounded-xl font-bold uppercase text-[10px]">Penicillin</Badge>
                    <Badge color="red" className="w-full justify-start h-9 rounded-xl font-bold uppercase text-[10px]">Peanuts</Badge>
                 </div>
              </div>
           </div>

           {/* Main Content Area */}
           <div className="xl:col-span-3 space-y-8">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm min-h-[700px]"
                 >
                    {activeTab === 'summary' && (
                       <div className="space-y-12">
                          <div className="flex items-center justify-between">
                             <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Summary</h3>
                             <Badge color="gray" className="bg-slate-50 border-none font-bold text-slate-400">LAST UPDATED: 2H AGO</Badge>
                          </div>

                          {/* Vitals Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                             {[
                               { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                               { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                               { label: 'Temp', value: '36.8', unit: '°C', icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-50' },
                               { label: 'SpO2', value: '98', unit: '%', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                             ].map((vital) => (
                               <div key={vital.label} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-500/5 transition-all">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", vital.bg, vital.color)}>
                                     <vital.icon size={20} />
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vital.label}</p>
                                  <div className="flex items-baseline gap-1 mt-1">
                                     <span className="text-2xl font-black text-slate-900">{vital.value}</span>
                                     <span className="text-[10px] font-bold text-slate-400">{vital.unit}</span>
                                  </div>
                               </div>
                             ))}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="p-8 rounded-[32px] border border-slate-100 space-y-6">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                   <Stethoscope size={18} className="text-emerald-500" />
                                   Current Diagnosis
                                </h4>
                                <div className="space-y-4">
                                   <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                                      <p className="text-sm font-bold text-slate-900">Chronic Migraine with Aura</p>
                                      <p className="text-xs text-slate-500 mt-1">Diagnosed: Aug 2023 • Managed by Dr. Parker</p>
                                   </div>
                                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                      <p className="text-sm font-bold text-slate-900">Mild Hypertension</p>
                                      <p className="text-xs text-slate-500 mt-1">Controlled with lifestyle changes</p>
                                   </div>
                                </div>
                             </div>

                             <div className="p-8 rounded-[32px] border border-slate-100 space-y-6">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                   <Calendar size={18} className="text-emerald-500" />
                                   Upcoming Appointments
                                </h4>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex flex-col items-center justify-center text-slate-900 font-black shadow-sm group-hover:border-emerald-200">
                                         <span className="text-[10px] uppercase font-bold text-emerald-600">NOV</span>
                                         <span className="text-lg leading-none">12</span>
                                      </div>
                                      <div className="flex-1">
                                         <p className="text-sm font-bold text-slate-900">Bi-Monthly Follow-up</p>
                                         <p className="text-xs text-slate-500">Virtual Session • 14:30 PM</p>
                                      </div>
                                      <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'notes' && (
                       <div className="space-y-8">
                          <div className="flex items-center justify-between">
                             <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Encounter Notes</h3>
                             <Button className="h-10 rounded-xl bg-slate-900 text-white font-bold border-none gap-2">
                                <Plus size={16} /> New Note
                             </Button>
                          </div>
                          
                          <div className="space-y-4">
                             {[1, 2].map((i) => (
                               <div key={i} className="p-8 rounded-[32px] border border-slate-100 hover:border-emerald-200 transition-all group">
                                  <div className="flex items-center justify-between mb-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                           <FileText size={24} />
                                        </div>
                                        <div>
                                           <p className="font-bold text-slate-900">Routine Neurological Assessment</p>
                                           <p className="text-xs text-slate-500">Oct 24, 2023 • Dr. Louisa Parker</p>
                                        </div>
                                     </div>
                                     <button className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                        <Edit size={18} />
                                     </button>
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
                                     Patient reports decreased frequency of aura incidents. Sleep hygiene has improved. Vitals are stable. Refined the dosage for amitriptyline and scheduled a follow-up imaging session for next month to monitor vascular response.
                                  </p>
                                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2">
                                     <Badge color="gray" className="bg-slate-50 border-none font-bold uppercase text-[9px]">S.O.A.P</Badge>
                                     <Badge color="gray" className="bg-slate-50 border-none font-bold uppercase text-[9px]">MIGRAINE</Badge>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
