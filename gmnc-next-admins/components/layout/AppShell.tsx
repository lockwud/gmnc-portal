"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { GlobalSearch } from "../dashboard/GlobalSearch";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LayoutProvider, useLayout } from "@/lib/context/LayoutContext";
import { UIProvider, useUI } from "@/lib/context/UIContext";
import { cn } from "@/lib/utils";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useLayout();
  const { toasts, removeToast } = useUI();

  return (
    <div className="flex min-h-screen bg-content-bg">
      <Sidebar />
      {/* Main Wrapper with dynamic margin based on Sidebar width */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 duration-300 ease-in-out",
          isCollapsed ? "md:pl-[80px]" : "md:pl-[280px]"
        )}
      >
        <TopBar />
        <main className="flex-1 duration-500 overflow-x-hidden p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <GlobalSearch />

      {/* Toast Container */}
      <div className="fixed bottom-8 right-8 z-[150] pointer-events-none flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className={cn(
                "pointer-events-auto px-6 py-4 glass rounded-2xl shadow-xl flex items-center gap-3 border min-w-[300px]",
                toast.type === "success" && "border-emerald-500/20 bg-emerald-50/90 text-emerald-800",
                toast.type === "error" && "border-rose-500/20 bg-rose-50/90 text-rose-800",
                toast.type === "info" && "border-blue-500/20 bg-blue-50/90 text-blue-800"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                toast.type === "success" && "bg-emerald-500",
                toast.type === "error" && "bg-rose-500",
                toast.type === "info" && "bg-blue-500"
              )} />
              <span className="font-bold text-sm tracking-tight">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <UIProvider>
        <ShellContent>{children}</ShellContent>
      </UIProvider>
    </LayoutProvider>
  );
}
