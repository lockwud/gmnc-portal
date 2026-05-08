"use client";

import * as React from "react";
import {
  User,
  FileText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  sessions: number;
  joinDate: string;
}

interface ProviderProfilePanelProps {
  provider: Provider | null;
}

export function ProviderProfilePanel({ provider }: ProviderProfilePanelProps) {
  if (!provider) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white text-slate-200">
          <User size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-400">No Provider Selected</h4>
        <p className="mt-2 max-w-[200px] text-sm text-slate-300">
          Select a provider from the list to view their full profile details.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm duration-500">
      <div className="flex-1 space-y-8 overflow-y-auto p-8">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-slate-100 bg-slate-50 text-slate-300 shadow-inner">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-primary">
              {provider.name}
            </h3>
            <p className="text-sm font-bold text-slate-400">
              Occupational Therapist
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Bio & About
          </h4>
          <p className="text-[13px] font-medium leading-relaxed text-slate-500">
            Highly experienced professional specialized in pediatric care and
            motor skill development. Committed to delivering exceptional patient
            results.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Languages spoken
          </h4>
          <p className="text-[13px] font-bold text-primary">English, Ga, Twi</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Verification Documents
          </h4>
          <div className="space-y-3">
            {[
              { label: "ID No.", value: provider.id, icon: FileText },
              {
                label: "Certificates",
                value: "Medical_License_2025.pdf",
                icon: ShieldCheck,
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-50 bg-slate-50 p-4 transition-all hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 transition-colors group-hover:text-primary">
                    <doc.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-slate-400">
                      {doc.label}
                    </p>
                    <p className="text-xs font-bold tracking-tight text-primary">
                      {doc.value}
                    </p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Performance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Response time
              </p>
              <p className="mt-1 text-sm font-black text-primary">1h 4m</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Retention
              </p>
              <p className="mt-1 text-sm font-black text-primary">94%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-50 p-8 pt-4">
        <Button className="h-14 w-full rounded-2xl font-black">
          Approve verification
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-12 rounded-2xl font-bold text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
          >
            Reject
          </button>

          <button
            type="button"
            className="h-12 rounded-2xl font-bold text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-500"
          >
            Send warning
          </button>
        </div>
      </div>
    </div>
  );
}