import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  className,
  actions,
}) => {
  return (
    <Card className={cn('border border-slate-200 bg-white text-slate-900 overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
