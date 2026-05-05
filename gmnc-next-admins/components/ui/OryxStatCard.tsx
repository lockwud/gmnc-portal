import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface SubMetric {
  label: string;
  value: string | number;
  color: 'emerald' | 'rose' | 'slate' | 'amber' | 'blue';
}

interface OryxStatCardProps {
  title: string;
  value: string | number;
  subMetrics?: SubMetric[];
  icon?: React.ReactNode;
  className?: string;
}

export const OryxStatCard: React.FC<OryxStatCardProps> = ({
  title,
  value,
  subMetrics,
  icon,
  className,
}) => {
  const colorMap = {
    emerald: 'text-emerald-600 ',
    rose: 'text-emerald-600 ',
    slate: 'text-slate-600 ',
    amber: 'text-amber-600 ',
    blue: 'text-blue-600 ',
  };


  return (
    <Card className={cn('p-5 bg-white border border-slate-200 relative overflow-hidden', className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
        {icon && <div className="text-slate-400 group-hover:text-[#10B981] transition-colors">{icon}</div>}
      </div>
      
      <div className="mb-4">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-50">
          {subMetrics.map((metric, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                colorMap[metric.color]
              )}
            >
              <span>{metric.label}</span>
              <span className="opacity-60">{metric.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
