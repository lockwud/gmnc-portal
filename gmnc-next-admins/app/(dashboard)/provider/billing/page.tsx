"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCardIcon, ZapIcon, CheckCircle2Icon, ShieldCheckIcon, AlertCircleIcon, ArrowUpRightIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

export default function ProviderBillingPage() {
  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscription & Usage</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Manage your plan, view session limits, and billing history.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <ArrowUpRightIcon size={18} /> Upgrade Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Active Plan */}
           <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">Active Plan</span>
                    <ShieldCheckIcon className="text-accent" size={24} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-extrabold">Professional</h2>
                    <p className="text-white/60 text-sm mt-1">Enterprise-grade features for clinics.</p>
                 </div>
                 <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-white/60">Renewal Date</span>
                       <span className="font-bold">June 12, 2025</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-white/60">Monthly Cost</span>
                       <span className="font-bold">GH₵ 450.00</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Usage Metrics */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Telehealth Sessions', value: '42 / 100', percent: 42, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Patient Profiles', value: '882 / 1,000', percent: 88, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Cloud Storage', value: '2.4 GB / 10 GB', percent: 24, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Custom Workflows', value: '3 / 5', percent: 60, color: 'text-primary', bg: 'bg-slate-50' },
              ].map((metric) => (
                <div key={metric.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</p>
                      <span className={cn("text-xs font-bold", metric.color)}>{metric.percent}%</span>
                   </div>
                   <div className="space-y-3">
                      <p className="text-xl font-extrabold text-slate-900">{metric.value}</p>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full rounded-full transition-all duration-1000", metric.bg.replace('bg-', 'bg-').split(' ')[0].replace('50', '500'))} 
                           style={{ width: `${metric.percent}%` }} 
                         />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
           <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest opacity-60 mb-6">Plan Privileges</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                'Unlimited Patient Records',
                'HD Video Consultations',
                'Advanced Outcome Analytics',
                'Priority 24/7 Support',
                'Multi-Clinic Synchronization',
                'Audit Trail Export (CSV/PDF)',
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                   <CheckCircle2Icon className="text-emerald-500 shrink-0" size={18} />
                   {feature}
                </div>
              ))}
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
