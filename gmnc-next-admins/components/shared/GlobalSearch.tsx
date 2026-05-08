"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, User, Calendar, FileText, Settings, CreditCard, MessageSquare, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/context/UIContext";

export const GlobalSearch = () => {
  const router = useRouter();
  const { isSearchOpen: isOpen, setSearchOpen: setIsOpen } = useUI();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  const runCommand = React.useCallback((command: () => void) => {
    setIsOpen(false);
    command();
  }, [setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <Command className="flex h-full w-full flex-col overflow-hidden">
              <div className="flex items-center border-b border-slate-100 px-6 py-4" cmdk-input-wrapper="">
                <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                <Command.Input
                  placeholder="Search across GmNC Portal... (Ctrl+K)"
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                />
              </div>
              <Command.List className="max-h-[450px] overflow-y-auto overflow-x-hidden p-4 scrollbar-thin scrollbar-thumb-slate-200">
                <Command.Empty className="py-12 text-center text-sm text-slate-500 font-medium">
                  No results found for this search.
                </Command.Empty>
                
                <Command.Group heading="Frequently Accessed" className="px-2 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Item icon={<User className="text-blue-500" />} onSelect={() => runCommand(() => router.push("/admin/users"))}>
                    Manage Users
                  </Item>
                  <Item icon={<Calendar className="text-emerald-500" />} onSelect={() => runCommand(() => router.push("/provider/appointments"))}>
                    Patient Appointments
                  </Item>
                  <Item icon={<MessageSquare className="text-amber-500" />} onSelect={() => runCommand(() => router.push("/support/tickets"))}>
                    Support Tickets
                  </Item>
                </Command.Group>

                <div className="h-px bg-slate-50 my-2" />

                <Command.Group heading="Settings & Billing" className="px-2 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Item icon={<Settings className="text-slate-500" />} onSelect={() => runCommand(() => router.push("/settings"))}>
                    Global Settings
                  </Item>
                  <Item icon={<CreditCard className="text-indigo-500" />} onSelect={() => runCommand(() => router.push("/provider/billing"))}>
                    Subscription & Billing
                  </Item>
                </Command.Group>

                <div className="h-px bg-slate-50 my-2" />

                <Command.Group heading="Quick Links" className="px-2 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Item icon={<Briefcase className="text-rose-500" />} onSelect={() => runCommand(() => router.push("/provider/referrals"))}>
                    Send Medical Referral
                  </Item>
                  <Item icon={<FileText className="text-emerald-500" />} onSelect={() => runCommand(() => router.push("/support/faqs"))}>
                    Knowledge Base (FAQ)
                  </Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Item = ({ children, icon, onSelect }: { children: React.ReactNode; icon: React.ReactNode; onSelect?: () => void }) => (
  <Command.Item
    onSelect={onSelect}
    className="flex cursor-pointer select-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 aria-selected:bg-emerald-50 aria-selected:text-emerald-700 transition-all group"
  >
    <div className="w-10 h-10 rounded-xl bg-slate-50 group-aria-selected:bg-emerald-100/50 flex items-center justify-center transition-colors">
      {icon}
    </div>
    {children}
  </Command.Item>
);
