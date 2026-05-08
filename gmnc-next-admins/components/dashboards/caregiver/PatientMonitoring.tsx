"use client";

import * as React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  Droplets, 
  Moon, 
  Utensils, 
  Plus, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Heart
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";

const DATA = [
  { time: '08:00', heartRate: 72, temp: 36.6 },
  { time: '10:00', heartRate: 75, temp: 36.7 },
  { time: '12:00', heartRate: 82, temp: 36.8 },
  { time: '14:00', heartRate: 78, temp: 36.6 },
  { time: '16:00', heartRate: 74, temp: 36.5 },
  { time: '18:00', heartRate: 70, temp: 36.4 },
];

export function PatientMonitoring() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Activity className="text-emerald-500" size={28} />
             Remote Monitoring
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
             Real-time health tracking for <span className="text-slate-900 font-bold">Kojo Mensah</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            className="h-12 gap-2 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border-none font-bold shadow-xl shadow-slate-900/10 transition-all"
            onClick={() => toast.success('Metric logging form opened')}
           >
              <Plus size={18} />
              Log Daily Metric
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Live Stats */}
         <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative group">
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                           <Heart size={24} />
                        </div>
                        <Badge color="green" className="font-black text-[9px] px-2 py-1">NORMAL</Badge>
                     </div>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Avg Heart Rate</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900">74</span>
                        <span className="text-sm font-bold text-slate-400">bpm</span>
                     </div>
                     <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
                        <ArrowDownRight size={14} />
                        2% from yesterday
                     </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
               </div>

               <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative group">
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                           <Droplets size={24} />
                        </div>
                        <Badge color="yellow" className="font-black text-[9px] px-2 py-1">CHECK FLUIDS</Badge>
                     </div>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Hydration Level</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900">62</span>
                        <span className="text-sm font-bold text-slate-400">%</span>
                     </div>
                     <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-xs">
                        <ArrowUpRight size={14} />
                        Low intake today
                     </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
               </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 tracking-tight">Heart Rate Trends</h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">24-hour continuous monitoring data.</p>
                  </div>
                  <Select options={[{label: 'Last 24h', value: '24h'}, {label: 'Last 7d', value: '7d'}]} className="w-32 bg-slate-50/50" />
               </div>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={DATA}>
                        <defs>
                           <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Daily Checklist & Alerts */}
         <div className="xl:col-span-1 space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                     <AlertCircle size={20} className="text-rose-500" />
                     Caregiver Tasks
                  </h3>
                  <div className="space-y-4">
                     {[
                       { label: 'Morning Medication', icon: Activity, done: true },
                       { label: 'Physical Exercise', icon: Activity, done: false },
                       { label: 'Fluid Intake Log', icon: Droplets, done: false },
                       { label: 'Blood Pressure Check', icon: Heart, done: true },
                     ].map((task, i) => (
                       <div key={i} className={cn(
                         "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                         task.done ? "bg-white/10 border-white/5 opacity-50" : "bg-white/5 border-white/10 hover:bg-white/15"
                       )}>
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", task.done ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40")}>
                             {task.done ? <ChevronRight size={20} /> : <task.icon size={20} />}
                          </div>
                          <span className={cn("text-sm font-bold", task.done && "line-through text-white/40")}>{task.label}</span>
                       </div>
                     ))}
                  </div>
                  <Button 
                    className="w-full mt-8 h-12 rounded-2xl bg-white text-slate-900 font-bold border-none hover:bg-white/90"
                    onClick={() => toast.success('Loading full task list...')}
                  >
                     View All Tasks
                  </Button>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Moon size={18} className="text-indigo-500" />
                  Sleep Quality
               </h3>
               <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Rest Efficiency</span>
                        <span className="text-slate-900">82%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[82%] h-full bg-indigo-500 rounded-full" />
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-slate-900">6.5h</p>
                     <p className="text-[10px] text-slate-400 font-bold">DEEP SLEEP</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
