"use client";

import * as React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Users, HeartPulse, Activity, Search, Filter, MoreVertical, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const barData = [
  { name: "Mon", value: 40 },
  { name: "Tue", value: 20 },
  { name: "Wed", value: 35 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 45 },
  { name: "Sat", value: 10 },
  { name: "Sun", value: 25 },
];

const patientDistribution = [
  { no: 1, name: "Blessing Naa Torshie", age: 10, sex: "Female", location: "Takoradi", sessions: 25 },
  { no: 2, name: "Kwaw Nuamah", age: 8, sex: "Male", location: "Cantonments", sessions: 18 },
  { no: 3, name: "Mubarak Salisu", age: 12, sex: "Male", location: "Labadi", sessions: 30 },
  { no: 4, name: "Jessica Panamang", age: 7, sex: "Female", location: "Osu", sessions: 22 },
];

const nonAdherent = [
  { name: "Blessing Naa Torshie", days: "2 days" },
  { name: "Jessica Panamang", days: "5 days" },
  { name: "Mubarak Salisu", days: "2 days" },
  { name: "Jessica Panamang", days: "5 days" },
];

export default function AnalyticsPage() {
  const [gaugeData] = React.useState([{ value: 64 }]);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-12 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Analytics</h1>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Bar Chart & Gauge */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Radial Gauge */}
               <Card className="p-8 border-none shadow-sm flex flex-col items-center justify-center min-h-[380px] bg-white text-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">General Improvement</h3>
                  <div className="relative w-full h-64 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height={256}>
                        <RadialBarChart
                          innerRadius="80%"
                          outerRadius="100%"
                          data={gaugeData}
                          startAngle={210}
                          endAngle={-30}
                        >
                          <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                          />
                          <RadialBar
                            background={{ fill: "#eff6ff" }}
                            dataKey="value"
                            cornerRadius={30}
                            fill="#10b981"
                          />
                        </RadialBarChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-primary">64%</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase mt-1">Excellent</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-3 w-full gap-2 mt-2">
                     {["Good 40%", "General 64%", "Bad 10%"].map((label, i) => (
                        <div key={i} className="flex flex-col items-center">
                           <div className={cn("w-1.5 h-1.5 rounded-full mb-1", i === 1 ? "bg-emerald-500" : i === 0 ? "bg-blue-400" : "bg-rose-400")} />
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                        </div>
                     ))}
                  </div>
               </Card>

               {/* Bar Chart */}
               <Card className="p-8 border-none shadow-sm min-h-[380px] flex flex-col pt-10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Average Improvement</h3>
                     <select className="text-[10px] font-bold uppercase tracking-widest text-primary bg-slate-50 px-2 py-1 rounded-lg border-none focus:outline-none">
                       <option>Weekly</option>
                       <option>Monthly</option>
                     </select>
                  </div>
                  <div className="flex-1 w-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                         <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} 
                           dy={10}
                         />
                         <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                         <Bar dataKey="value" fill="#10b981" radius={[6, 6, 6, 6]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
            </div>

            {/* Patient Distribution List */}
            <Card className="border-none shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary">Patient distribution list</h3>
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input placeholder="Search..." className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none w-48" />
                     </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                       <Filter size={16} />
                     </Button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="p-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No.</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sex</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                          <th className="p-4 pr-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Count</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {patientDistribution.map((p) => (
                          <tr key={p.no} className="hover:bg-slate-50/50 transition-colors">
                             <td className="p-4 pl-6 text-xs text-slate-500">{p.no}</td>
                             <td className="p-4 text-xs font-bold text-primary">{p.name}</td>
                             <td className="p-4 text-xs text-slate-600">{p.age}</td>
                             <td className="p-4 text-xs text-slate-600">{p.sex}</td>
                             <td className="p-4 text-xs text-slate-600">{p.location}</td>
                             <td className="p-4 pr-6 text-xs font-bold text-emerald-600">{p.sessions}</td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </Card>
          </div>

          {/* Right Column: Non-Adherent List */}
          <div className="lg:col-span-4 h-full">
             <Card className="border-none shadow-sm h-full flex flex-col p-8 pt-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Non-Adherent List</h3>
                <div className="space-y-6 flex-1">
                   {nonAdherent.map((item, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-primary font-bold text-xs", i % 2 === 0 ? "bg-amber-50" : "bg-emerald-50")}>
                               {item.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary group-hover:text-emerald-600 transition-colors">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Missed {item.days}</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-primary">
                            <MoreVertical size={16} />
                         </Button>
                      </div>
                   ))}
                </div>
                <div className="pt-8">
                   <Button variant="ghost" className="w-full rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs py-5">
                     View Full Report
                   </Button>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
