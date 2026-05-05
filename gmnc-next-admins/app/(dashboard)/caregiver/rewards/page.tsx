"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { GiftIcon, Share2Icon, TrophyIcon, CopyIcon, UsersIcon, CheckCircle2Icon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { OryxStatCard } from '@/components/ui/OryxStatCard';

export default function RewardsPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rewards & Referrals</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Invite friends and earn clinical credits and rewards.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <GiftIcon size={18} /> Redeem Points
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <OryxStatCard 
             title="Current Points"
             value="1,250"
             icon={<TrophyIcon size={20} className="text-amber-500" />}
             subMetrics={[{ label: 'Value', value: 'GH₵ 125.00', color: 'emerald' }]}
           />
           <OryxStatCard 
             title="Total Referrals"
             value="8"
             icon={<UsersIcon size={20} className="text-blue-500" />}
             subMetrics={[{ label: 'Active', value: '5 Parents', color: 'blue' }]}
           />
           <OryxStatCard 
             title="Earnings History"
             value="GH₵ 400"
             icon={<GiftIcon size={20} className="text-emerald-500" />}
             subMetrics={[{ label: 'Status', value: 'All Redeemed', color: 'slate' }]}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-2">
                 <h2 className="text-2xl font-extrabold text-slate-900">Share your link</h2>
                 <p className="text-slate-500 font-medium">Get GH₵ 50 for every parent who joins and completes their first session.</p>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                 <code className="flex-1 px-4 text-sm font-bold text-slate-600 truncate">gmnc.app/ref/tijani882</code>
                 <Button variant="amber" size="sm" className="h-10 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent/10">
                    <CopyIcon size={14} /> COPY
                 </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                 <Button variant="outline" className="h-14 rounded-2xl font-bold border-slate-200 text-slate-600 flex items-center gap-3">
                    <Share2Icon size={18} /> WhatsApp
                 </Button>
                 <Button variant="outline" className="h-14 rounded-2xl font-bold border-slate-200 text-slate-600 flex items-center gap-3">
                    <Share2Icon size={18} /> Email
                 </Button>
              </div>
           </div>

           <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-8">
              <h3 className="text-lg font-extrabold text-slate-900">How it works</h3>
              <div className="space-y-6">
                 {[
                   { t: 'Share your unique link', d: 'Send it to other parents or caregivers.' },
                   { t: 'They sign up', d: 'They register their account using your link.' },
                   { t: 'First session completed', d: 'Once they finish a consult, you get rewarded.' },
                   { t: 'Redeem rewards', d: 'Use your points for future clinic visits.' },
                 ].map((step, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                         {i + 1}
                      </div>
                      <div>
                         <p className="font-extrabold text-slate-900 text-sm">{step.t}</p>
                         <p className="text-xs text-slate-500 font-medium">{step.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
