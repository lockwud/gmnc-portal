import * as React from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string | number;
  percent: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  href?: string;
}

export function MetricCard({
  title,
  value,
  percent,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  href,
}: MetricCardProps) {
  const content = (
    <CardContent className="p-4 space-y-4">
      {/* Row 1: Icon & Title */}
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <p className="text-[17px] text-[#0F172A] tracking-tight">{title}</p>
      </div>

      {/* Row 2: Value & Percent Badge */}
      <div className="flex items-baseline gap-2 pt-1">
        <h2 className="text-4xl font-[600] text-[#0F172A] tracking-tight">{value}</h2>
        <div className="bg-[#4176FF] text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-[0_2px_10px_rgba(65,118,255,0.3)]">
          {percent}
        </div>
      </div>

      {/* Row 3: Change Text */}
      <p className="text-[11px] text-slate-600 uppercase tracking-tight">
        {change}
      </p>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-[1.5rem] hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-[1.5rem] hover:ring-1 hover:ring-slate-100 transition-all">
      {content}
    </Card>
  );
}
