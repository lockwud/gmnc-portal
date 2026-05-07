"use client";

import React, { useState } from 'react';
import { 
  REVENUE_DATA, 
  AUDIT_LOGS 
} from '@/lib/data/mockData';
import { OryxStatCard } from '@/components/ui/OryxStatCard';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { Modal } from '@/components/ui/Modal';
import { 
  UsersIcon, 
  CreditCardIcon, 
  DollarSignIcon, 
  AlertTriangleIcon,
  ShieldAlertIcon,
  PlusIcon,
  DownloadIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell as PieCell,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Input } from '../ui/Input';

const PIE_DATA = [
  { name: 'Active', value: 756, color: '#059669' },
  { name: 'Inactive', value: 12, color: '#f59e0b' },
  { name: 'New', value: 648, color: '#3b82f6' },
];

const MOCK_PATIENTS = [
  { 
    id: '1', 
    name: 'Amelia Hart', 
    mrn: 'NC-10293', 
    dob: '1992-05-14',
    gender: 'Female',
    ward: 'Neuro ICU',
    diagnosis: 'Ischemic Stroke',
    neuroStatus: 'Stable',
    gcs: '15',
    neurologist: 'Dr. Sarah Chen',
    notes: 'Admitted following sudden onset of left-sided weakness.'
  },
  { 
    id: '2', 
    name: 'Marcus Lin', 
    mrn: 'NC-10318', 
    dob: '1988-11-02',
    gender: 'Male',
    ward: 'Epilepsy Monitoring (EMU)',
    diagnosis: 'Refractory Epilepsy',
    neuroStatus: 'Alert',
    gcs: '15',
    neurologist: 'Dr. James Wilson',
    notes: 'Routine monitoring for seizure activity.'
  },
];

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [activeFilter, setActiveFilter] = useState('This Week');

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient);
    setIsEditingPatient(false);
    setIsEditPatientModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Analytics & Operations
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsNewPatientModalOpen(true)}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[#059669] hover:text-[#059669] transition-all flex items-center gap-2 shadow-sm"
          >
            <PlusIcon size={14} />
            New Patient
          </button>
          
          <button className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-[#059669] hover:bg-emerald-50">
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-end items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-2 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-lg border transition-all whitespace-nowrap",
               activeFilter === filter 
                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OryxStatCard 
          title="Total Users"
          value="2,450"
          icon={<UsersIcon size={20} />}
          subMetrics={[
            { label: 'Active', value: '98%', color: 'emerald' },
            { label: 'New', value: '+124', color: 'blue' }
          ]}
        />
        <OryxStatCard 
          title="Revenue (MTD)"
          value="GH₵ 85,210"
          icon={<DollarSignIcon size={20} />}
          subMetrics={[
            { label: 'Growth', value: '+15%', color: 'emerald' },
            { label: 'Target', value: '92%', color: 'amber' }
          ]}
        />
        <OryxStatCard 
          title="Active Subscriptions"
          value="1,240"
          icon={<CreditCardIcon size={20} />}
          subMetrics={[
            { label: 'Pro', value: 890, color: 'blue' },
            { label: 'Basic', value: 350, color: 'slate' }
          ]}
        />
        <OryxStatCard 
          title="Open Tickets"
          value="12"
          icon={<AlertTriangleIcon size={20} />}
          subMetrics={[
            { label: 'Critical', value: 3, color: 'rose' },
            { label: 'Queue', value: 'Stable', color: 'emerald' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Status Breakdown (Circular Chart) */}
        <ChartContainer title="Patient Overview" subtitle="Status distribution breakdown">
          <div className="h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Daily Attendance (Bar Chart) */}
        <ChartContainer title="Daily Session Activity" subtitle="Attendance status by weekday" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="subscriptions" name="Sessions" radius={[4, 4, 0, 0]}>
                {REVENUE_DATA.map((entry, index) => (
                  <PieCell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#fda4af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* User Growth */}
         <ChartContainer title="Platform Growth" subtitle="Monthly new registrations">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
         </ChartContainer>

         {/* Active Patients List */}
         <div className="bg-white rounded p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Patients</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {MOCK_PATIENTS.length} admitted
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_PATIENTS.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => handleEditPatient(patient)}
                  className="p-4 rounded-xl bg-slate-50/50 hover:bg-emerald-50/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">{patient.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MRN {patient.mrn}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase border-emerald-100 text-emerald-600 bg-white font-bold">
                      {patient.ward}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Diagnosis</p>
                      <p className="text-[10px] font-semibold text-slate-600">{patient.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Neuro status</p>
                      <p className="text-[10px] font-semibold text-slate-600">{patient.neuroStatus}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">GCS</p>
                      <p className="text-[10px] font-semibold text-slate-600">{patient.gcs}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="bg-white rounded p-5  overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h3>
              <button className="text-[10px] font-bold text-[#059669] uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {AUDIT_LOGS.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 group hover:border-emerald-500/20 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[#059669]">
                    <ShieldAlertIcon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-900">{log.action}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{log.user} • {log.timestamp}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                    log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-50 text-emerald-600'
                  )}>
                    {log.status}
                  </div>
                </div>
              ))}
            </div>
         </div>
      </div>

      <Modal 
        isOpen={isNewPatientModalOpen} 
        onClose={() => setIsNewPatientModalOpen(false)} 
        title="Admit New Patient"
        className="max-w-2xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-4">Enter the patient's neurological intake details.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full name</label>
              <Input placeholder="Jane Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of birth</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRN</label>
                <Input placeholder="NC-00000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ward</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Neuro ICU</option>
                  <option>Stroke Unit</option>
                  <option>EMU</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary diagnosis</label>
              <Input placeholder="e.g. Ischemic stroke" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neurological status</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Alert</option>
                  <option>Stable</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GCS (3–15)</label>
                <Input type="number" placeholder="15" min="3" max="15" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending neurologist</label>
              <Input placeholder="Dr. ..." />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission notes</label>
              <textarea 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none resize-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                placeholder="Presenting symptoms, NIHSS, plan..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button 
              onClick={() => setIsNewPatientModalOpen(false)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
            >
              Close
            </button>
            <button 
              onClick={() => setIsNewPatientModalOpen(false)}
              className="flex-1 py-2.5 bg-brand text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-hover shadow-xl shadow-brand/20 transition-all"
            >
              Admit patient
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditPatientModalOpen}
        onClose={() => setIsEditPatientModalOpen(false)}
        title={selectedPatient?.name || "Patient Record"}
        className="max-w-2xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
           <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl -mt-4 mb-6">
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedPatient?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Viewing patient record</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit</span>
                <button 
                  onClick={() => setIsEditingPatient(!isEditingPatient)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative p-1",
                    isEditingPatient ? "bg-[#059669]" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 bg-white rounded-full transition-all",
                    isEditingPatient ? "ml-5" : "ml-0"
                  )} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full name</label>
                  <Input disabled={!isEditingPatient} defaultValue={selectedPatient?.name} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRN</label>
                  <Input disabled={!isEditingPatient} defaultValue={selectedPatient?.mrn} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ward</label>
                <select 
                  disabled={!isEditingPatient} 
                  defaultValue={selectedPatient?.ward}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                >
                  <option value="Neuro ICU">Neuro ICU</option>
                  <option value="Stroke Unit">Stroke Unit</option>
                  <option value="EMU">EMU</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neurologist</label>
                <Input disabled={!isEditingPatient} defaultValue={selectedPatient?.neurologist} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Diagnosis</label>
              <Input disabled={!isEditingPatient} defaultValue={selectedPatient?.diagnosis} />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission notes</label>
               <textarea 
                  disabled={!isEditingPatient}
                  defaultValue={selectedPatient?.notes}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none resize-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
               />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-50">
              <button 
                onClick={() => setIsEditPatientModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
              >
                Close
              </button>
              {isEditingPatient && (
                <button className="flex-1 py-2.5 bg-brand text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 transition-all">
                  Update Record
                </button>
              )}
            </div>
        </div>
      </Modal>
    </div>
  );
}
