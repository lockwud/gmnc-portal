import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'gray' | 'red' | 'emerald' | 'rose' | 'amber';
  variant?: 'blue' | 'green' | 'yellow' | 'gray' | 'red' | 'emerald' | 'rose' | 'amber';
  className?: string;
  onClick?: () => void;
};

const Badge: React.FC<Props> = ({ children, color, variant, className, onClick }) => {
  const activeColor = variant || color || 'gray';
  
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold transition-all',
        colors[activeColor as keyof typeof colors],
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
