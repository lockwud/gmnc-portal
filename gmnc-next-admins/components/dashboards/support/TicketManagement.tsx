"use client";

import * as React from "react";
import { Table } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { 
  MessageCircle, 
  Search, 
  Filter, 
  LifeBuoy, 
  Clock, 
  User, 
  ArrowUpRight, 
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TICKETS = [
  { id: 'TIC-901', subject: 'Login issue with 2FA', user: 'Ama Serwaa', priority: 'High', status: 'Open', created: '10 min ago' },
  { id: 'TIC-902', subject: 'Cannot export EMR', user: 'Dr. Parker', priority: 'Medium', status: 'In-Progress', created: '1 hour ago' },
  { id: 'TIC-903', subject: 'Telehealth lag during calls', user: 'John Smith', priority: 'High', status: 'Open', created: '2 hours ago' },
  { id: 'TIC-904', subject: 'Billing question', user: 'Efua Boateng', priority: 'Low', status: 'Resolved', created: 'Yesterday' },
];

export function TicketManagement() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <LifeBuoy className="text-blue-500" size={28} />
             Support Helpdesk
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
             Manage platform support tickets and technical assistance requests.
          </p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-2xl font-black text-slate-900">42</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tickets</p>
           </div>
           <div className="w-[1px] h-10 bg-slate-100" />
           <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">98%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfaction</p>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Unassigned', value: '12', color: 'bg-rose-50 text-rose-600' },
           { label: 'In Review', value: '8', color: 'bg-amber-50 text-amber-600' },
           { label: 'Resolved', value: '245', color: 'bg-emerald-50 text-emerald-600' },
           { label: 'Avg Response', value: '14m', color: 'bg-blue-50 text-blue-600' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold", stat.color)}>
                 <ArrowUpRight size={18} />
              </div>
           </div>
         ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <h3 className="text-xl font-extrabold text-slate-900">Open Tickets</h3>
           <div className="flex gap-2">
              <Button 
                variant="gray" 
                className="h-10 rounded-xl border border-slate-100 text-xs font-bold gap-2"
                onClick={() => toast.success('Ticket filters updated')}
              >
                 <Filter size={14} /> Filter
              </Button>
           </div>
        </div>
        <Table 
          data={TICKETS}
          columns={[
            { header: 'Ticket Information', accessor: (item) => (
              <div className="flex items-center gap-4 py-1">
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center",
                   item.status === 'Open' ? 'bg-rose-50 text-rose-500' : item.status === 'In-Progress' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                 )}>
                    <MessageCircle size={20} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 tracking-tight">{item.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.id}</p>
                 </div>
              </div>
            )},
            { header: 'Requested By', accessor: (item) => (
              <div className="flex items-center gap-2">
                 <User size={14} className="text-slate-400" />
                 <span className="text-sm font-bold text-slate-700">{item.user}</span>
              </div>
            )},
            { header: 'Priority', accessor: (item) => (
              <Badge 
                variant={item.priority === 'High' ? 'rose' : item.priority === 'Medium' ? 'amber' : 'gray'}
                className="rounded-lg font-bold uppercase tracking-wider text-[9px]"
              >
                {item.priority}
              </Badge>
            )},
            { header: 'Created', accessor: (item) => (
              <div className="flex items-center gap-2 text-slate-400">
                 <Clock size={14} />
                 <span className="text-[11px] font-bold">{item.created}</span>
              </div>
            )},
          ]}
          actions={(item) => (
            <div className="flex items-center justify-end gap-1">
               <Button 
                  className="h-9 px-4 rounded-lg bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider"
                  onClick={() => toast.success(`Drafting reply to ${item.user}...`)}
                >
                  Reply
                </Button>
               <button className="p-2 text-slate-300 hover:text-slate-900 rounded-lg">
                  <MoreVertical size={16} />
               </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
