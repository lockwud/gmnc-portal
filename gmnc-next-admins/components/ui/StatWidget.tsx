import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  description?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  className,
  description,
}) => {
  return (
    <Card className={cn('overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:shadow-md', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-slate-50 text-primary">
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn(
              'flex items-center text-xs font-bold px-2 py-1 rounded-lg',
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
              trend === 'down' ? 'bg-rose-50 text-rose-600' : 
              'bg-slate-50 text-slate-600'
            )}>
              {trend === 'up' ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
              {change}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
          {description && (
            <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
          )}
        </div>
      </div>
      <div className="h-1 w-full bg-slate-50">
        <div className={cn(
          "h-full bg-primary opacity-20",
          trend === 'up' ? "bg-emerald-500" : trend === 'down' ? "bg-rose-500" : "bg-primary"
        )} style={{ width: '40%' }} />
      </div>
    </Card>
  );
};
