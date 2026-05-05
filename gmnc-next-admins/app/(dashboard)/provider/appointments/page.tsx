"use client";

import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, PlusIcon, VideoIcon, ClockIcon, UserIcon, MoreHorizontalIcon, FilterIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const MOCK_APPOINTMENTS = [
  { id: 'APT-101', patient: 'Tijani Dromo', time: '10:00 AM', date: 'Today', type: 'Telehealth', status: 'Upcoming' },
  { id: 'APT-102', patient: 'Samuel Aboagye', time: '11:30 AM', date: 'Today', type: 'Physical', status: 'In Progress' },
  { id: 'APT-103', patient: 'Sedem Gadokey', time: '02:00 PM', date: 'Today', type: 'Telehealth', status: 'Scheduled' },
  { id: 'APT-104', patient: 'Beryl Mensah', time: '09:00 AM', date: 'Tomorrow', type: 'Physical', status: 'Confirmed' },
];

export default function AppointmentsPage() {
  const [view, setView] = useState('list');

  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Management</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Manage your schedule, telehealth sessions, and patient visits.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-100 p-1 rounded-xl flex">
                <button 
                  onClick={() => setView('list')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", view === 'list' ? "bg-white shadow-sm" : "text-slate-400")}
                >List</button>
                <button 
                  onClick={() => setView('calendar')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", view === 'calendar' ? "bg-white shadow-sm" : "text-slate-400")}
                >Calendar</button>
             </div>
             <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
               <PlusIcon size={18} /> Book New
             </Button>
          </div>
        </div>

        {view === 'list' ? (
          <Table 
            title="Today & Upcoming"
            data={MOCK_APPOINTMENTS}
            columns={[
              { header: 'Patient', accessor: (item) => (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <UserIcon size={14} />
                   </div>
                   <span className="font-bold text-slate-900">{item.patient}</span>
                </div>
              )},
              { header: 'Time', accessor: (item) => (
                <div className="flex items-center gap-2">
                   <ClockIcon size={14} className="text-slate-300" />
                   <span className="text-xs font-bold text-slate-600">{item.time} <span className="text-[10px] text-slate-400">({item.date})</span></span>
                </div>
              )},
              { header: 'Type', accessor: (item) => (
                <div className="flex items-center gap-2">
                   {item.type === 'Telehealth' ? <VideoIcon size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-amber-500" />}
                   <span className="text-[11px] font-bold text-slate-500 uppercase">{item.type}</span>
                </div>
              )},
              { header: 'Status', accessor: (item) => (
                <Badge variant={item.status === 'Upcoming' ? 'warning' : item.status === 'In Progress' ? 'success' : 'secondary'} className="text-[9px] uppercase font-bold">
                   {item.status}
                </Badge>
              )},
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                 {item.type === 'Telehealth' && (
                   <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold h-8 px-3 rounded-lg flex items-center gap-1.5">
                      <VideoIcon size={12} /> JOIN
                   </Button>
                 )}
                 <button className="p-2 text-slate-300 hover:text-primary transition-all">
                    <MoreHorizontalIcon size={18} />
                 </button>
              </div>
            )}
          />
        ) : (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                <CalendarIcon size={40} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Interactive Calendar View</h2>
             <p className="text-slate-400 text-sm max-w-sm">Synchronizing your professional calendar with external providers (Google/Outlook) to display full scheduling details.</p>
             <Button variant="ghost" className="text-accent font-bold uppercase tracking-widest text-[11px]">Refresh Calendar</Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
