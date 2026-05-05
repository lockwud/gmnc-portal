import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "amber" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-brand text-white hover:bg-brand-hover shadow-sm",
      secondary: "bg-slate-100 text-brand hover:bg-slate-200",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
      amber: "border border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 transition-colors",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-brand",
      danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
      success: "bg-brand text-white hover:bg-brand-hover shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
