"use client";

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { VideoIcon, CalendarIcon, HistoryIcon, LockIcon, InfoIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';

export default function TelehealthPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Telehealth Sessions</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Join live video consultations and view your session history.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <CalendarIcon size={18} /> Schedule New
          </Button>
        </div>

        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-accent">
                 <VideoIcon size={40} />
              </div>
              <div>
                 <h2 className="text-2xl font-extrabold">Next Session: Dr. Louisa Parker</h2>
                 <p className="text-white/60 font-medium">Tomorrow at 10:00 AM • Speech Therapy</p>
              </div>
           </div>
           <Button className="bg-white text-primary hover:bg-accent hover:text-white font-extrabold px-12 py-7 rounded-2xl shadow-2xl relative z-10">
              JOIN ROOM
           </Button>
        </div>

        <Table 
          title="Session History"
          data={[
            { id: 'SES-001', doctor: 'Dr. Louisa Parker', date: 'May 05, 2025', duration: '45 mins', status: 'Completed' },
            { id: 'SES-002', doctor: 'Dr. Mensah', date: 'May 02, 2025', duration: '30 mins', status: 'Completed' },
          ]}
          columns={[
            { header: 'Session ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-accent' },
            { header: 'Provider', accessor: 'doctor', className: 'font-bold text-slate-900' },
            { header: 'Date', accessor: 'date', className: 'text-[11px] font-bold text-slate-400' },
            { header: 'Duration', accessor: 'duration', className: 'text-xs text-slate-500 font-medium' },
            { header: 'Status', accessor: (item) => <Badge variant="success" className="text-[9px] uppercase font-bold">{item.status}</Badge> },
          ]}
        />
      </div>
    </ProtectedRoute>
  );
}
