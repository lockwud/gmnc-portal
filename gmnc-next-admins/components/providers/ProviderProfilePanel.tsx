"use client";

import * as React from "react";
import { User, FileText, Clock, AlertTriangle, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-4">
            <User size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-400">No Provider Selected</h4>
        <p className="text-sm text-slate-300 mt-2 max-w-[200px]">Select a provider from the list to view their full profile details.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right duration-500">
      <div className="p-8 flex-1 overflow-y-auto space-y-8">
        {/* Header Profile Info */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-primary tracking-tight">{provider.name}</h3>
            <p className="text-sm font-bold text-slate-400">Occupational Therapist</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Bio & About</h4>
          <p className="text-[13px] font-medium text-slate-500 leading-relaxed">
            Highly experienced professional specialized in pediatric care and motor skill development. Committed to delivering exceptional patient results.
          </p>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Languages spoken</h4>
          <p className="text-[13px] font-bold text-primary">English, Ga, Twi</p>
        </div>

        {/* Documents */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Verification Documents</h4>
          <div className="space-y-3">
            {[
              { label: "ID No.", value: provider.id, icon: FileText },
              { label: "Certificates", value: "Medical_License_2025.pdf", icon: ShieldCheck },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50 group hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 group-hover:text-primary transition-colors">
                    <doc.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">{doc.label}</p>
                    <p className="text-xs font-bold text-primary tracking-tight">{doc.value}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Response time</p>
                <p className="text-sm font-black text-primary mt-1">1h 4m</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Retention</p>
                <p className="text-sm font-black text-primary mt-1">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-8 pt-4 border-t border-slate-50 space-y-3">
        <Button variant="amber" className="w-full h-14 rounded-2xl font-black shadow-lg shadow-amber-500/10">
          Approve verification
        </Button>
        <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">Reject</Button>
            <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all">Send warning</Button>
        </div>
      </div>
    </div>
  );
}
