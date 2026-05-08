"use client";

import * as React from "react";
import { Bell, Check, Trash2, Calendar, MessageSquare, AlertCircle, Info, Filter, MoreHorizontal, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

type NotificationType = "appointment" | "message" | "system" | "security";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority?: "low" | "medium" | "high" | "critical";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "appointment",
    title: "Appointment Reminder",
    message: "Upcoming session with Dr. Smith today at 2:30 PM.",
    time: "10 mins ago",
    isRead: false,
    priority: "high",
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "Nurse Sarah sent you a follow-up about the clinical notes.",
    time: "45 mins ago",
    isRead: false,
  },
  {
    id: "3",
    type: "security",
    title: "Security Alert",
    message: "New login detected from a Chrome browser on Windows.",
    time: "2 hours ago",
    isRead: true,
    priority: "critical",
  },
  {
    id: "4",
    type: "system",
    title: "System Update",
    message: "GmNC Portal will be undergoing maintenance on Saturday at 2 AM.",
    time: "5 hours ago",
    isRead: true,
  },
];

export const NotificationsCenter = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = React.useState<"all" | "unread" | "archived">("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge color="red" className="h-6 px-2 rounded-lg font-bold">
                {unreadCount} NEW
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Stay updated with your latest clinical and system alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="gray" 
            onClick={markAllRead}
            className="text-emerald-600 hover:bg-emerald-50 font-bold text-xs gap-2 border border-emerald-100"
          >
            <Check size={14} />
            Mark all as read
          </Button>
          <Button 
            variant="gray" 
            className="text-slate-400 hover:bg-slate-50 font-bold text-xs gap-2 border border-slate-100"
          >
            <Filter size={14} />
            Filter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-6">
        {["all", "unread", "archived"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={cn(
              "px-6 py-3 text-sm font-bold capitalize transition-all relative",
              filter === t ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t}
            {filter === t && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
              />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={cn(
                  "p-5 rounded-[24px] border transition-all group relative overflow-hidden",
                  n.isRead 
                    ? "bg-white border-slate-100 opacity-70 grayscale-[0.2]" 
                    : "bg-white border-emerald-100 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/5"
                )}
              >
                {!n.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                )}
                
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                    n.type === "appointment" && "bg-blue-50 text-blue-500",
                    n.type === "message" && "bg-emerald-50 text-emerald-500",
                    n.type === "security" && "bg-rose-50 text-rose-500",
                    n.type === "system" && "bg-amber-50 text-amber-500",
                  )}>
                    {n.type === "appointment" && <Calendar size={22} />}
                    {n.type === "message" && <MessageSquare size={22} />}
                    {n.type === "security" && <AlertCircle size={22} />}
                    {n.type === "system" && <Info size={22} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="font-bold text-slate-900 truncate tracking-tight">{n.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-3">{n.message}</p>
                    
                    <div className="flex items-center gap-3">
                      <button className="text-emerald-600 font-bold text-xs flex items-center gap-1 hover:underline group-hover:gap-2 transition-all">
                        View Details
                        <ArrowRight size={14} />
                      </button>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <button className="text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors">
                        Archive
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="text-slate-200 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h3>
              <p className="text-slate-400 text-sm font-medium">No new notifications to show in this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
