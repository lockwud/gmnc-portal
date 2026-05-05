import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: { label: string; value: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, icon, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <select
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              "pr-10", // Space for the chevron
              error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500",
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-500 ml-1">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
