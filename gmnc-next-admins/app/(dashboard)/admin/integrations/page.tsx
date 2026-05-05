"use client";

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { LinkIcon, SettingsIcon, AlertCircleIcon, ShieldCheckIcon, GlobeIcon, DatabaseIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

const MOCK_INTEGRATIONS = [
  { id: 1, name: 'National Health ID (NHIS)', status: 'Connected', lastSync: '2 mins ago', type: 'Gov API' },
  { id: 2, name: 'Korle-Bu HMS', status: 'Error', lastSync: '1 hour ago', type: 'Institutional' },
  { id: 3, name: 'St. John’s Hospital', status: 'Connected', lastSync: '15 mins ago', type: 'Institutional' },
  { id: 4, name: 'Payment Gateway (Paystack)', status: 'Connected', lastSync: 'Real-time', type: 'Financial' },
];

export default function IntegrationsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Integrations</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Manage external connections, health systems, and data synchronization.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <LinkIcon size={18} /> Add Integration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Table 
                title="Active Integrations"
                data={MOCK_INTEGRATIONS}
                columns={[
                  { header: 'System Name', accessor: (item) => (
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          {item.type === 'Gov API' ? <GlobeIcon size={20} /> : <DatabaseIcon size={20} />}
                       </div>
                       <div>
                          <p className="font-extrabold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.type}</p>
                       </div>
                    </div>
                  )},
                  { header: 'Status', accessor: (item) => (
                    <div className="flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", item.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
                       <span className={cn("text-[10px] font-bold uppercase", item.status === 'Connected' ? 'text-emerald-600' : 'text-rose-600')}>{item.status}</span>
                    </div>
                  )},
                  { header: 'Last Sync', accessor: 'lastSync', className: 'text-[11px] font-bold text-slate-400' },
                ]}
                actions={() => (
                  <button className="p-2 text-slate-300 hover:text-primary transition-all">
                    <SettingsIcon size={18} />
                  </button>
                )}
              />
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest opacity-60 flex items-center gap-2">
                 <AlertCircleIcon size={18} className="text-rose-500" /> Critical Error Logs
              </h3>
              <div className="space-y-4">
                 {[
                   { code: 'NHIS-401', msg: 'Unauthorized: API Key Expired', time: '10:45 AM' },
                   { code: 'HMS-500', msg: 'Internal Server Error (Korle-Bu)', time: '09:20 AM' },
                 ].map((err, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{err.code}</span>
                         <span className="text-[9px] font-bold text-rose-400">{err.time}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{err.msg}</p>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400">View All Logs</Button>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
