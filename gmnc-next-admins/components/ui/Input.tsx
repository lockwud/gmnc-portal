"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, icon, id, type = "text", error, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="text-sm font-bold text-primary">
            {label}
          </label>
        ) : null}
        <div className="relative">
          {icon ? (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/5 disabled:cursor-not-allowed disabled:opacity-60",
              error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10" : null,
              icon ? "pl-12" : null,
              className,
            )}
            {...props}
          />
        </div>
        {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };