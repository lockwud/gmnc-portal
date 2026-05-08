"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Bell, Shield, Lock, CreditCard, HelpCircle, ChevronRight } from 'lucide-react';

interface SettingsLayoutProps {
  title: string;
  description: string;
  tabs: {
    id: string;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
  }[];
}

export function SettingsLayout({ title, description, tabs }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0].id);

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">{description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white text-slate-500 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600 shadow-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                   "p-1.5 rounded-lg transition-colors",
                   activeTab === tab.id ? "bg-white/20" : "bg-slate-50 group-hover:bg-emerald-50"
                )}>
                   {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 18 })}
                </div>
                {tab.label}
              </div>
              <ChevronRight size={16} className={cn("transition-transform", activeTab === tab.id ? "rotate-0" : "opacity-0")} />
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 lg:p-10 rounded-[40px] border border-slate-100 shadow-sm"
          >
            {currentTab.component}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
