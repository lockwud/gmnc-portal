"use client";

import * as React from "react";
import { 
  Zap, 
  Terminal, 
  Bug, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Activity, 
  ShieldCheck, 
  Layers,
  Play
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TEST_RUNS = [
  { id: 'TR-401', name: 'Auth Flow E2E', status: 'Passed', duration: '1m 20s', coverage: '98%', time: '10 min ago' },
  { id: 'TR-402', name: 'Clinical Data Integrity', status: 'Passed', duration: '4m 45s', coverage: '92%', time: '1 hour ago' },
  { id: 'TR-403', name: 'Telehealth Signaling', status: 'Failed', duration: '30s', coverage: '45%', time: '2 hours ago' },
  { id: 'TR-404', name: 'Billing Calculation', status: 'Passed', duration: '12s', coverage: '100%', time: '3 hours ago' },
];

export function QAConsole() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Zap className="text-amber-500" size={28} />
             QA & Testing Console
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
             Monitor system stability, run automated test suites, and track technical debt.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="gray" 
            className="h-12 rounded-2xl font-bold border border-slate-100 bg-white gap-2"
            onClick={() => toast.success('Loading debug logs...')}
           >
              <Terminal size={18} />
              Debug Logs
           </Button>
           <Button 
            className="h-12 gap-2 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border-none font-bold shadow-xl shadow-indigo-500/20 transition-all"
            onClick={() => toast.success('Full automated test suite initiated')}
           >
              <Play size={18} />
              Run Full Suite
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* System Health */}
         <div className="xl:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="font-bold flex items-center gap-2">
                        <Activity size={18} className="text-emerald-500" />
                        Infrastructure
                     </h3>
                     <Badge className="bg-emerald-500 text-white border-none font-black text-[9px]">HEALTHY</Badge>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Main Database</span>
                        <span className="text-xs font-bold">12ms latency</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">S3 Storage</span>
                        <span className="text-xs font-bold">Operational</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Redis Cache</span>
                        <span className="text-xs font-bold">Hit Rate: 94%</span>
                     </div>
                  </div>
                  <div className="w-full h-px bg-white/10 my-8" />
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold">Uptime: 99.998%</span>
                     </div>
                     <RefreshCcw size={16} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
                  </div>
               </div>
               <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Bug size={18} className="text-rose-500" />
                  Bug Backlog
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'UI glitch in TopBar mobile', priority: 'Low' },
                    { label: 'DatePicker year selection offset', priority: 'Medium' },
                    { label: 'Login timeout race condition', priority: 'High' },
                  ].map((bug, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-700">{bug.label}</span>
                       <Badge color={bug.priority === 'High' ? 'rose' : bug.priority === 'Medium' ? 'amber' : 'gray'} className="text-[8px] font-black uppercase">{bug.priority}</Badge>
                    </div>
                  ))}
               </div>
               <Button 
                variant="gray" 
                className="w-full h-10 rounded-xl border border-slate-100 text-xs font-bold"
                onClick={() => toast.success('Loading bug backlog...')}
               >
                  View All Bugs
               </Button>
            </div>
         </div>

         {/* Test Runner View */}
         <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                     <Layers className="text-indigo-600" />
                     Automated Test Runs
                  </h3>
                  <div className="relative">
                  </div>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {TEST_RUNS.map((run) => (
                    <div key={run.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                            run.status === 'Passed' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                          )}>
                             {run.status === 'Passed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 tracking-tight">{run.name}</p>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{run.id}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-500">Duration: {run.duration}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-sm font-black text-slate-900">{run.coverage}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coverage</p>
                          </div>
                          <div className="text-right min-w-[80px]">
                             <p className="text-[11px] font-bold text-slate-400">{run.time}</p>
                             <Button variant="gray" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCcw size={14} />
                             </Button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
                  <p className="text-xs font-bold text-slate-400">Showing last 4 runs. <span className="text-indigo-600 cursor-pointer hover:underline">View History</span></p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
