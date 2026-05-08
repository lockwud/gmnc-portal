"use client";

import React, { useState } from "react";
import { Table } from "@/components/ui/Table";
import  Button  from "@/components/ui/Button";
import { CalendarIcon, PlusIcon, VideoIcon, ClockIcon, UserIcon, MoreHorizontalIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import  Badge  from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const MOCK_APPOINTMENTS = [
  { id: "APT-101", patient: "Tijani Dromo", time: "10:00 AM", date: "Today", type: "Telehealth", status: "Upcoming" },
  { id: "APT-102", patient: "Samuel Aboagye", time: "11:30 AM", date: "Today", type: "Physical", status: "In Progress" },
  { id: "APT-103", patient: "Sedem Gadokey", time: "02:00 PM", date: "Today", type: "Telehealth", status: "Scheduled" },
  { id: "APT-104", patient: "Beryl Mensah", time: "09:00 AM", date: "Tomorrow", type: "Physical", status: "Confirmed" },
];

export default function AppointmentsPage() {
  const [view, setView] = useState("list");

  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Appointment Management</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage your schedule, telehealth sessions, and patient visits.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setView("list")}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold uppercase transition-all rounded-lg",
                  view === "list" ? "bg-white shadow-sm" : "text-slate-400"
                )}
              >
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold uppercase transition-all rounded-lg",
                  view === "calendar" ? "bg-white shadow-sm" : "text-slate-400"
                )}
              >
                Calendar
              </button>
            </div>
            <button type="button" className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-accent/20">
              <PlusIcon size={18} /> Book New
            </button>
          </div>
        </div>

        {view === "list" ? (
          <Table
            title="Today & Upcoming"
            data={MOCK_APPOINTMENTS}
            columns={[
              {
                header: "Patient",
                accessor: (item: { patient: string }) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UserIcon size={14} />
                    </div>
                    <span className="font-bold text-slate-900">{item.patient}</span>
                  </div>
                ),
              },
              {
                header: "Time",
                accessor: (item: { time: string; date: string }) => (
                  <div className="flex items-center gap-2">
                    <ClockIcon size={14} className="text-slate-300" />
                    <span className="text-xs font-bold text-slate-600">
                      {item.time} <span className="text-[10px] text-slate-400">({item.date})</span>
                    </span>
                  </div>
                ),
              },
              {
                header: "Type",
                accessor: (item: { type: string }) => (
                  <div className="flex items-center gap-2">
                    {item.type === "Telehealth" ? <VideoIcon size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-amber-500" />}
                    <span className="text-[11px] font-bold uppercase text-slate-500">{item.type}</span>
                  </div>
                ),
              },
              {
                header: "Status",
                accessor: (item: { status: string }) => (
                  <span className="text-[9px] font-bold uppercase text-slate-500">
                    {item.status}
                  </span>
                ),
              },
            ]}
            actions={(item: { type: string }) => (
              <div className="flex items-center gap-2">
                {item.type === "Telehealth" && (
                  <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white hover:bg-blue-700">
                    <VideoIcon size={12} /> JOIN
                  </button>
                )}
                <button aria-label="More appointment actions" className="p-2 text-slate-300 transition-all hover:text-primary">
                  <MoreHorizontalIcon size={18} />
                </button>
              </div>
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-[2rem] border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-200">
              <CalendarIcon size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Interactive Calendar View</h2>
            <p className="max-w-sm text-sm text-slate-400">Synchronizing your professional calendar with external providers (Google/Outlook) to display full scheduling details.</p>
            <button type="button" className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Refresh Calendar
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}