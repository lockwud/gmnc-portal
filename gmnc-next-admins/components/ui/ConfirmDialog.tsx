"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, HelpCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "rose" | "amber" | "emerald" | "blue";
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "rose",
  isLoading = false,
}: ConfirmDialogProps) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const variants = {
    rose: {
      icon: <AlertTriangle className="text-rose-500 w-6 h-6" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
      button: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
    },
    amber: {
      icon: <AlertCircle className="text-amber-500 w-6 h-6" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
    },
    emerald: {
      icon: <CheckCircle2 className="text-emerald-500 w-6 h-6" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    },
    blue: {
      icon: <HelpCircle className="text-blue-500 w-6 h-6" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    },
  };

  const currentVariant = variants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header / Icon */}
            <div className="p-8 pb-0 flex flex-col items-center text-center">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border", currentVariant.bg, currentVariant.border)}>
                {currentVariant.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="p-8 flex flex-col sm:flex-row gap-3">
              <Button
                variant="gray"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-12 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-bold text-white border-none shadow-lg transition-all",
                  currentVariant.button
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </Button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
