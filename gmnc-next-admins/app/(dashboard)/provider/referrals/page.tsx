"use client";

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SendIcon, SearchIcon, FilterIcon, MoreVerticalIcon, UserPlusIcon, ExternalLinkIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';

const MOCK_REFERRALS = [
  { id: 'REF-001', patient: 'Sedem Gadokey', to: 'Dr. Mensah (Physio)', date: 'May 10, 2025', status: 'Pending' },
  { id: 'REF-002', patient: 'Tijani Dromo', to: 'Korle-Bu Speech Dept', date: 'May 08, 2025', status: 'Accepted' },
  { id: 'REF-003', patient: 'Samuel Aboagye', from: 'Dr. Parker', date: 'May 05, 2025', status: 'Completed' },
];

export default function ProviderReferralsPage() {
  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Referral Management</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Send and track patient referrals to other specialists or institutions.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <SendIcon size={18} /> New Referral
          </Button>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                placeholder="Search referrals..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium"
              />
           </div>
        </div>

        <Table 
          title="Recent Referrals"
          data={MOCK_REFERRALS}
          columns={[
            { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-accent' },
            { header: 'Patient', accessor: 'patient', className: 'font-bold text-slate-900' },
            { header: 'Target Specialist', accessor: (item) => (
              <span className="text-xs font-medium text-slate-600">{item.to || item.from}</span>
            )},
            { header: 'Date', accessor: 'date', className: 'text-[11px] font-bold text-slate-400' },
            { header: 'Status', accessor: (item) => (
              <Badge variant={item.status === 'Accepted' ? 'success' : item.status === 'Pending' ? 'warning' : 'secondary'} className="text-[9px] uppercase font-bold">
                 {item.status}
              </Badge>
            )},
          ]}
          actions={() => (
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-300 hover:text-accent transition-all" title="View Details">
                  <ExternalLinkIcon size={18} />
               </button>
               <button className="p-2 text-slate-300 hover:text-primary transition-all">
                  <MoreVerticalIcon size={18} />
               </button>
            </div>
          )}
        />
      </div>
    </ProtectedRoute>
  );
}
