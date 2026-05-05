"use client";

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { UsersIcon, GiftIcon, TrendingUpIcon, MegaphoneIcon, Share2Icon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OryxStatCard } from '@/components/ui/OryxStatCard';

const MOCK_CAMPAIGNS = [
  { id: 1, name: 'Summer Referral 2025', status: 'Active', clicks: 2450, signups: 124, rewardsPaid: 'GH₵ 12,400' },
  { id: 2, name: 'Provider Network Growth', status: 'Active', clicks: 890, signups: 42, rewardsPaid: 'GH₵ 8,400' },
  { id: 3, name: 'Alpha Launch Program', status: 'Completed', clicks: 500, signups: 10, rewardsPaid: 'GH₵ 1,000' },
];

export default function ReferralManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Referral Campaigns</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Monitor and manage referral programs and rewards.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <MegaphoneIcon size={18} /> Launch Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <OryxStatCard 
             title="Total Referrals"
             value="176"
             icon={<UsersIcon size={20} className="text-blue-500" />}
             subMetrics={[{ label: 'Conversion', value: '5.1%', color: 'emerald' }]}
           />
           <OryxStatCard 
             title="Rewards Issued"
             value="GH₵ 21,800"
             icon={<GiftIcon size={20} className="text-amber-500" />}
             subMetrics={[{ label: 'Pending', value: 'GH₵ 2,400', color: 'amber' }]}
           />
           <OryxStatCard 
             title="Growth Rate"
             value="+12.4%"
             icon={<TrendingUpIcon size={20} className="text-emerald-500" />}
             subMetrics={[{ label: 'Target', value: '15%', color: 'slate' }]}
           />
        </div>

        <Table 
          title="Active Campaigns"
          data={MOCK_CAMPAIGNS}
          columns={[
            { header: 'Campaign Name', accessor: 'name', className: 'font-extrabold text-slate-900' },
            { header: 'Status', accessor: (item) => (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase border border-emerald-100">
                 {item.status}
              </span>
            )},
            { header: 'Clicks', accessor: 'clicks', className: 'font-mono text-xs text-slate-500' },
            { header: 'New Signups', accessor: 'signups', className: 'font-bold text-primary' },
            { header: 'Rewards Paid', accessor: 'rewardsPaid', className: 'font-bold text-emerald-600' },
          ]}
          actions={() => (
            <button className="p-2 text-slate-300 hover:text-accent transition-all">
               <Share2Icon size={18} />
            </button>
          )}
        />
      </div>
    </ProtectedRoute>
  );
}
