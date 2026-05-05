'use client';

import React, { useState } from 'react';
import { 
  PROVIDER_STATS, 
  APPOINTMENTS,
  REVENUE_DATA
} from '@/lib/data/mockData';
import { OryxStatCard } from '@/components/ui/OryxStatCard';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  VideoIcon,
  PlusIcon,
  FileTextIcon,
  UserPlusIcon,
  PlayIcon,
  StethoscopeIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';

export function ProviderDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const handleStartSession = (session: any) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Workflow</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            Next session starts in 15 minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <PlusIcon className="w-3.5 h-3.5" />
            New Appointment
          </button>
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-[#059669] hover:text-[#059669] transition-all shadow-sm flex items-center gap-2">
            <VideoIcon className="w-3.5 h-3.5" />
            Start Telehealth
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OryxStatCard 
          title="Today's Appointments"
          value="8"
          icon={<CalendarIcon size={20} />}
          subMetrics={[
            { label: 'Confirmed', value: 5, color: 'emerald' },
            { label: 'Pending', value: 3, color: 'amber' }
          ]}
        />
        <OryxStatCard 
          title="Sessions Completed"
          value="124"
          icon={<CheckCircleIcon size={20} />}
          subMetrics={[
            { label: 'This Week', value: '+12', color: 'blue' },
            { label: 'Rating', value: '4.9/5', color: 'emerald' }
          ]}
        />
        <OryxStatCard 
          title="Clinical Hours"
          value="32.5h"
          icon={<StethoscopeIcon size={20} />}
          subMetrics={[
            { label: 'Utilization', value: '88%', color: 'blue' },
            { label: 'Admin', value: '4h', color: 'slate' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Table 
            title="Today's Schedule"
            data={APPOINTMENTS}
            columns={[
              { header: 'Time', accessor: 'time', className: 'font-bold text-slate-900' },
              { header: 'Patient', accessor: 'patient', className: 'font-extrabold text-slate-900' },
              { header: 'Condition', accessor: 'condition', className: 'text-slate-500 text-xs font-medium' },
              { 
                header: 'Status', 
                accessor: (item) => (
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                    item.status === 'Upcoming' ? 'bg-slate-50 text-slate-600 border-slate-100' : 
                    item.status === 'Confirmed' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  )}>
                    {item.status}
                  </span>
                )
              },
            ]}
            actions={(item) => (
              <button 
                onClick={() => handleStartSession(item)}
                className="flex items-center gap-2 px-3 py-1 bg-white text-slate-600 border border-slate-200 rounded-lg text-[9px] font-bold uppercase hover:border-slate-900 hover:text-slate-900 transition-all group shadow-sm"
              >
                <PlayIcon className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                Start
              </button>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Patient Progress" subtitle="Aggregate neurological index">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="subscriptions" stroke="#64748b" strokeWidth={3} dot={{ fill: '#64748b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Adherence Rate" subtitle="Exercise completion frequency">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorAdh)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-6 uppercase tracking-widest opacity-60">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Refer Patient', sub: 'Send to specialist', icon: PlusIcon, color: 'slate' },
                { label: 'Clinical Notes', sub: 'Add to recent session', icon: FileTextIcon, color: 'slate' },
                { label: 'Enrollment', sub: 'New patient signup', icon: UserPlusIcon, color: 'slate' },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-500/20 hover:bg-white transition-all group shadow-sm">
                  <div className={cn(
                    "p-2 rounded-md transition-all bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white"
                  )}>
                    <action.icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-900">{action.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{action.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-hidden relative group shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <StethoscopeIcon size={80} className="text-[#059669]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight relative z-10">NeuroCare Pro Tip</h4>
            <p className="text-xs text-slate-500 mt-2 relative z-10 leading-relaxed font-bold uppercase tracking-wider opacity-60">
              Patients with Cerebral Palsy show 15% better adherence when reminders are sent 2 hours before the session.
            </p>
            <button className="mt-4 text-[10px] font-extrabold text-[#059669] hover:underline relative z-10 uppercase tracking-widest">Configure Reminders</button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Start Telehealth Session: ${selectedSession?.patient}`}
      >
        <div className="space-y-6">
          <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
             <VideoIcon className="w-12 h-12 text-slate-300" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm text-slate-500 font-medium">Patient: <span className="text-slate-900 font-bold">{selectedSession?.patient}</span></p>
            <p className="text-sm text-slate-500 font-medium">Condition: <span className="text-slate-900 font-bold">{selectedSession?.condition}</span></p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 bg-[#059669] text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity uppercase text-xs tracking-widest"
            >
              Launch Video Call
            </button>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
