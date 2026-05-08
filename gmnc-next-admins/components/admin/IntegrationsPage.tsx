"use client";

import React from "react";
import { Table } from "@/components/ui/Table";
import Button  from "@/components/ui/Button";
import { LinkIcon, SettingsIcon, AlertCircleIcon, GlobeIcon, DatabaseIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

const MOCK_INTEGRATIONS = [
  { id: 1, name: "National Health ID (NHIS)", status: "Connected", lastSync: "2 mins ago", type: "Gov API" },
  { id: 2, name: "Korle-Bu HMS", status: "Error", lastSync: "1 hour ago", type: "Institutional" },
  { id: 3, name: "St. John's Hospital", status: "Connected", lastSync: "15 mins ago", type: "Institutional" },
  { id: 4, name: "Payment Gateway (Paystack)", status: "Connected", lastSync: "Real-time", type: "Financial" },
];

export default function IntegrationsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Institutional Integrations</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage external connections, health systems, and data synchronization.</p>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-accent/20">
            <LinkIcon size={18} /> Add Integration
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Table
              title="Active Integrations"
              data={MOCK_INTEGRATIONS}
              columns={[
                {
                  header: "System Name",
                  accessor: (item: { name: string; type: string }) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        {item.type === "Gov API" ? <GlobeIcon size={20} /> : <DatabaseIcon size={20} />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{item.type}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  accessor: (item: { status: string }) => (
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", item.status === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                      <span className={cn("text-[10px] font-bold uppercase", item.status === "Connected" ? "text-emerald-600" : "text-rose-600")}>{item.status}</span>
                    </div>
                  ),
                },
                { header: "Last Sync", accessor: "lastSync", className: "text-[11px] font-bold text-slate-400" },
              ]}
              actions={() => (
                <button aria-label="Configure integration" className="p-2 text-slate-300 transition-all hover:text-primary">
                  <SettingsIcon size={18} />
                </button>
              )}
            />
          </div>

          <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-900 opacity-60">
              <AlertCircleIcon size={18} className="text-rose-500" /> Critical Error Logs
            </h3>
            <div className="space-y-4">
              {[
                { code: "NHIS-401", msg: "Unauthorized: API Key Expired", time: "10:45 AM" },
                { code: "HMS-500", msg: "Internal Server Error (Korle-Bu)", time: "09:20 AM" },
              ].map((error) => (
                <div key={error.code} className="space-y-1 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">{error.code}</span>
                    <span className="text-[9px] font-bold text-rose-400">{error.time}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{error.msg}</p>
                </div>
              ))}
            </div>
            <button type="button" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}