"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// Specific data points matching the visual representation in Figma
const therapistData = [{ value: 80, fill: "#B3EFEA" }]; // Teal
const caregiverData = [{ value: 65, fill: "#B3EF86" }]; // Green
const adultData = [{ value: 45, fill: "#8B5CF6" }];    // Purple

export function UserDistributionChart() {
  return (
    <Card className="flex flex-col h-full border border-slate-100 shadow-sm bg-white overflow-hidden rounded-[2rem]">
      <CardHeader className="pb-0 border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-primary">Total Users</CardTitle>
          <div className="flex items-center gap-2">
            <select className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none uppercase tracking-tighter">
                <option>This month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-[380px] relative mt-2">
        {/* Polar Axis Background Layer */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none pr-8">
            <ResponsiveContainer width="100%" height={300}>
               <PieChart>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 250]}
                    angleAxisId={0}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  {/* Invisible Pie to trigger labels */}
                  <Pie data={[{value: 1}]} dataKey="value" innerRadius={0} outerRadius={0} />
               </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    {/* Therapist (Outer) */}
                    <Pie
                        data={therapistData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-90} // Mocking the spread
                        innerRadius="70%"
                        outerRadius="82%"
                        paddingAngle={0}
                        isAnimationActive={true}
                    >
                        <Cell key="teal" fill="#B3EFEA" />
                    </Pie>

                    {/* Caregivers (Middle) */}
                    <Pie
                        data={caregiverData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-180}
                        innerRadius="48%"
                        outerRadius="62%"
                        paddingAngle={0}
                        isAnimationActive={true}
                    >
                        <Cell key="green" fill="#B3EF86" />
                    </Pie>

                    {/* Adults (Inner) */}
                    <Pie
                        data={adultData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={10}
                        innerRadius="20%"
                        outerRadius="42%"
                        paddingAngle={0}
                        isAnimationActive={true}
                    >
                        <Cell key="purple" fill="#8B5CF6" />
                    </Pie>
                    
                    {/* Label Positioning to the Left of Vertical Axis */}
                    <text x="47%" y="18%" textAnchor="end" className="fill-slate-400 text-[11px] font-bold uppercase tracking-tight">Therapist</text>
                    <text x="47%" y="30%" textAnchor="end" className="fill-slate-400 text-[11px] font-bold uppercase tracking-tight">Caregivers</text>
                    <text x="47%" y="43%" textAnchor="end" className="fill-slate-400 text-[11px] font-bold uppercase tracking-tight">Adults</text>
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total 400</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
