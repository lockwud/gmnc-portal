"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowUpRightIcon, CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Subscription & Usage</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage your plan, view session limits, and billing history.</p>
          </div>
          <Button variant="amber" className="gap-2 rounded-xl px-6 font-bold shadow-lg shadow-accent/20">
            <ArrowUpRightIcon size={18} /> Upgrade Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Active Plan</span>
                <ShieldCheckIcon className="text-accent" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold">Professional</h2>
                <p className="mt-1 text-sm text-white/60">Enterprise-grade features for clinics.</p>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Renewal Date</span>
                  <span className="font-bold">June 12, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Monthly Cost</span>
                  <span className="font-bold">GH₵ 450.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
            {[
              { label: "Telehealth Sessions", value: "42 / 100", percent: 42, color: "text-blue-500", bg: "bg-blue-500" },
              { label: "Patient Profiles", value: "882 / 1,000", percent: 88, color: "text-amber-500", bg: "bg-amber-500" },
              { label: "Cloud Storage", value: "2.4 GB / 10 GB", percent: 24, color: "text-emerald-500", bg: "bg-emerald-500" },
              { label: "Custom Workflows", value: "3 / 5", percent: 60, color: "text-primary", bg: "bg-primary" },
            ].map((metric) => (
              <div key={metric.label} className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{metric.label}</p>
                  <span className={cn("text-xs font-bold", metric.color)}>{metric.percent}%</span>
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-extrabold text-slate-900">{metric.value}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50">
                    <div className={cn("h-full rounded-full transition-all duration-1000", metric.bg)} style={{ width: `${metric.percent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-900 opacity-60">Plan Privileges</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              "Unlimited Patient Records",
              "HD Video Consultations",
              "Advanced Outcome Analytics",
              "Priority 24/7 Support",
              "Multi-Clinic Synchronization",
              "Audit Trail Export (CSV/PDF)",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <CheckCircle2Icon className="shrink-0 text-emerald-500" size={18} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}