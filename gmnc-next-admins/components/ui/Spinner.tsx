import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "slate";
}

export const Spinner = ({
  size = "md",
  variant = "primary",
  className,
  ...props
}: SpinnerProps) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
    xl: "w-16 h-16 border-4",
  };

  const variants = {
    primary: "border-brand/20 border-t-brand",
    white: "border-white/30 border-t-white",
    slate: "border-slate-200 border-t-slate-900",
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[100]">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm font-bold text-slate-900 animate-pulse tracking-tight">
        Loading Workspace...
      </p>
    </div>
  </div>
);
