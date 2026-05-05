"use client";

import * as React from "react";
import { User, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  count: string | number;
  percentage?: string;
  description?: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}

function StatItem({ label, count, percentage, description, icon: Icon, iconColor, iconBg }: StatItemProps) {
  return (
    <Card className="p-4 border border-slate-100 shadow-sm bg-white rounded-[1.5rem] group hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm", iconBg, iconColor)}>
          <Icon size={24} strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-primary tracking-tight">{count}</h3>
            {percentage && (
              <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                {percentage}
              </span>
            )}
          </div>
          {description && (
             <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ProviderStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatItem 
        label="Service Providers" 
        count="100" 
        percentage="30%" 
        description="+0.5% than last month"
        icon={ShieldCheck}
        iconColor="text-sky-500"
        iconBg="bg-sky-50"
      />
      <StatItem 
        label="Pending Verification" 
        count="59" 
        icon={Clock}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-50"
      />
      <StatItem 
        label="Active Providers" 
        count="70" 
        icon={User}
        iconColor="text-amber-500"
        iconBg="bg-amber-50"
      />
      <StatItem 
        label="Suspended" 
        count="5" 
        icon={AlertCircle}
        iconColor="text-rose-500"
        iconBg="bg-rose-50"
      />
    </div>
  );
}
