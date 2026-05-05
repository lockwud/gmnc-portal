"use client";

import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchIcon, DownloadIcon, FilterIcon, FileTextIcon, ActivityIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

const MOCK_LOGS = [
  { id: 'LOG-8820', timestamp: '2025-05-12 10:30:12', user: 'louisa@example.com', action: 'LOGIN_SUCCESS', ip: '192.168.1.1', status: 'Success' },
  { id: 'LOG-8821', timestamp: '2025-05-12 10:32:45', user: 'admin@gmnc.com', action: 'USER_DEACTIVATE', ip: '192.168.1.5', status: 'Success' },
  { id: 'LOG-8822', timestamp: '2025-05-12 10:35:01', user: 'unknown@hacker.com', action: 'LOGIN_FAILED', ip: '45.12.33.2', status: 'Warning' },
  { id: 'LOG-8823', timestamp: '2025-05-12 10:40:55', user: 'tijani@care.com', action: 'TELEHEALTH_JOIN', ip: '102.16.8.9', status: 'Success' },
];

export default function AuditLogPage() {
  const [filter, setFilter] = useState('All');

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Log Viewer</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Comprehensive history of all sensitive system actions.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2 px-6 font-bold rounded-xl border-slate-200 text-slate-400 hover:text-primary">
               <DownloadIcon size={18} /> Export PDF
             </Button>
             <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
               <FileTextIcon size={18} /> Export CSV
             </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                placeholder="Search logs (user, action, IP)..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium"
              />
           </div>
           <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              {['All', 'Warning', 'Success'].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter === t ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        <Table 
          title="Security Events"
          data={MOCK_LOGS.filter(l => filter === 'All' || l.status === filter)}
          columns={[
            { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-accent' },
            { header: 'Timestamp', accessor: 'timestamp', className: 'text-[11px] font-bold text-slate-400' },
            { header: 'User Identity', accessor: 'user', className: 'font-bold text-primary text-xs' },
            { header: 'Action', accessor: (item) => (
              <div className="flex items-center gap-2">
                 <ActivityIcon size={14} className="text-slate-300" />
                 <span className="text-xs font-bold text-slate-700">{item.action}</span>
              </div>
            )},
            { header: 'IP Address', accessor: 'ip', className: 'font-mono text-[11px] text-slate-400' },
            { header: 'Status', accessor: (item) => (
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                item.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              )}>
                {item.status}
              </span>
            )},
          ]}
        />
      </div>
    </ProtectedRoute>
  );
}
