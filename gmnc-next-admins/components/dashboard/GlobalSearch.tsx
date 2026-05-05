"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, User, ListChecks, Mail, PersonStanding, Flag, Settings as  X, Command } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const searchResults = [
  { group: "Navigation", items: [
    { name: "Dashboard", href: "/dashboard", icon: Flag },
    { name: "Service Providers", href: "/providers", icon: Users },
    { name: "Individuals with CP", href: "/clients", icon: User },
    { name: "Tasks & Schedule", href: "/tasks", icon: ListChecks },
  ]},
  { group: "Quick Actions", items: [
    { name: "Add New Provider", action: "add-provider", icon: Users },
    { name: "Support Tickets", href: "/support", icon: PersonStanding },
    { name: "Message Portal", href: "/inbox", icon: Mail },
  ]}
];

export function GlobalSearch() {
  const { isSearchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden"
        >
          {/* Search Input Area */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Search className="text-slate-400" size={24} />
            <input 
              autoFocus
              placeholder="Search anything... (Try 'Providers')"
              className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-primary placeholder:text-slate-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Command size={12} /> K
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
            {searchResults.map((group) => (
              <div key={group.group} className="mb-6 last:mb-2">
                <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  {group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase())
                  ).map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                          setSearchOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-emerald-50 group transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-all border border-transparent group-hover:border-emerald-100 shadow-sm">
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-700 group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <ArrowRight size={18} className="text-slate-200 group-hover:text-emerald-300 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {query && !searchResults.some(g => g.items.some(i => i.name.toLowerCase().includes(query.toLowerCase()))) && (
               <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
                    <Search size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">No results found for "{query}"</p>
               </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center">↵</div> Select
               </span>
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center">esc</div> Close
               </span>
             </div>
             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">GmNC Intelligent Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
