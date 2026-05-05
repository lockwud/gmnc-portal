'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { motion } from 'framer-motion';
import { useLayout } from '@/lib/context/LayoutContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useLayout();
  return (
    <div className="flex min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Subtle background gradient effects for light mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <Sidebar />
      
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "ml-[80px]" : "ml-[64px] lg:ml-[256px]"
        )}
      >
        <TopBar />
        <main className="flex-1 p-6 lg:p-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
