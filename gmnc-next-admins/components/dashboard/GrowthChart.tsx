"use client";

import * as React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

const data = [
  { name: "January", therapist: 20, patient: 85 },
  { name: "February", therapist: 28, patient: 70 },
  { name: "March", therapist: 15, patient: 95 },
  { name: "April", therapist: 22, patient: 55 },
  { name: "May", therapist: 45, patient: 115 },
  { name: "June", therapist: 15, patient: 65 },
  { name: "July", therapist: 25, patient: 48 },
  { name: "August", therapist: 40, patient: 72 },
  { name: "September", therapist: 30, patient: 50 },
  { name: "October", therapist: 20, patient: 100 },
];

export function GrowthChart() {
  return (
    <Card className="flex flex-col h-full border border-slate-100 shadow-sm bg-white overflow-hidden rounded-[2rem]">
      <CardHeader className="pb-0 border-b border-slate-50 bg-slate-50/30 p-6">
        <CardTitle className="text-sm font-bold text-primary">Total Sign Ups</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[360px] pt-10 p-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB7185" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTherapist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="patient" 
              stroke="#FB7185" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPatient)" 
              dot={{ r: 3, fill: "#fff", stroke: "#FB7185", strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="therapist" 
              stroke="#6366F1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTherapist)" 
              dot={{ r: 3, fill: "#fff", stroke: "#6366F1", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Chart Legend */}
        <div className="flex justify-center items-center gap-6 mt-6">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6366F1" }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Therapist</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FB7185" }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
