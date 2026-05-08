import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'gray';
  className?: string;
};

const Badge: React.FC<Props> = ({ children, color = 'gray', className }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;