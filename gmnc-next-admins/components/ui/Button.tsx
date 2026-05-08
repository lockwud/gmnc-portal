import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'gray';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button: React.FC<Props> = ({
  children,
  variant = 'primary',
  className,
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    gray: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        variants[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
