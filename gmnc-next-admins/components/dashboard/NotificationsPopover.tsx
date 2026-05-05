"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, UserPlus, AlertCircle, ShieldCheck, Clock, Check, ArrowRight } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const mockNotifications = [
  { id: 1, title: "New caregiver registered", description: "Tijani Dromo created a profile", time: "2m ago", type: "user", unread: true },
  { id: 2, title: "System alert", description: "API latency detected in Region A", time: "1h ago", type: "system", unread: true },
  { id: 3, title: "Approval Required", description: "Dr. Louisa Parker submitted docs", time: "3h ago", type: "approval", unread: false },
];

export function NotificationsPopover() {
  const { isNotificationsOpen, setNotificationsOpen } = useUI();
  const router = useRouter();
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationsOpen, setNotificationsOpen]);

  return (
    <AnimatePresence>
      {isNotificationsOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 top-14 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden z-[100]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-primary">Notifications</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">3 Unread Messages</p>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 transition-all p-2 rounded-xl hover:bg-emerald-50">
               <Check size={20} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
            {mockNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={cn(
                  "px-6 py-4 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer group relative",
                  notif.unread && "after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-12 after:bg-emerald-500 after:rounded-r-full"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                  notif.type === 'user' && "bg-blue-50 text-blue-500",
                  notif.type === 'system' && "bg-rose-50 text-rose-500",
                  notif.type === 'approval' && "bg-amber-50 text-amber-500",
                )}>
                  {notif.type === 'user' && <UserPlus size={18} />}
                  {notif.type === 'system' && <AlertCircle size={18} />}
                  {notif.type === 'approval' && <ShieldCheck size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-primary truncate">{notif.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{notif.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Link to Page */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <Button 
                variant="ghost" 
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-white transition-all shadow-sm group"
                onClick={() => {
                    router.push("/notifications");
                    setNotificationsOpen(false);
                }}
            >
                View all notifications
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
