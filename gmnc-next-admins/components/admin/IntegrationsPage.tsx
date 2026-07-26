"use client";

import React from "react";
import { AlertCircleIcon, LinkIcon } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function IntegrationsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Institutional Integrations</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage external connections, health systems, and data synchronization.</p>
          </div>
          <button type="button" disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-200 px-6 py-2 text-sm font-bold text-slate-500">
            <LinkIcon size={18} /> Add Integration
          </button>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-slate-900">No integrations API is available in the backend.</p>
              <p className="mt-1">This page does not display placeholder integrations. Add a backend integrations endpoint before enabling this workflow.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
