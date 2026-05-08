import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const FormField = ({
  label,
  description,
  error,
  required,
  children,
  className,
  id,
}: FormFieldProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between px-1">
        {label && (
          <label 
            htmlFor={id}
            className="text-sm font-bold text-slate-700 tracking-tight"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
      </div>

      <div className="relative group">
        {children}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-bold text-rose-500 flex items-center gap-1.5 px-1"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        ) : description ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-medium text-slate-400 px-1 leading-relaxed"
          >
            {description}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export { FormField };
