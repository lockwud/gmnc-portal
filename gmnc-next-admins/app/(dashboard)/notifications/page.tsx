"use client";

import * as React from "react";
import { 
  Bell, 
  UserPlus, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  MoreVertical, 
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const notifications = [
  {
    day: "Today",
    items: [
      { id: 1, title: "New caregiver registered", recipient: "Tijani Dromo", time: "7:15 PM", type: "user", isNew: true },
      { id: 2, title: "System alert", description: "A session API failed at 07:23 AM", time: "07:23 AM", type: "system", isNew: true },
      { id: 3, title: "Therapist awaiting approval", recipient: "Daniela Bawuah", description: "submitted their credentials for review", time: "7:15 PM", type: "approval", isNew: true, action: "Review now" },
    ]
  },
  {
    day: "Yesterday",
    items: [
      { id: 4, title: "New caregiver registered", recipient: "Tijani Dromo", time: "7:15 PM", type: "user", isNew: false },
    ]
  }
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with system activities and administrative tasks.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2 border-slate-200 bg-white">
             <Filter size={18} /> Filters
           </Button>
           <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50">
             Mark all as read
           </Button>
        </div>
      </div>

      <div className="space-y-10">
        {notifications.map((group) => (
          <div key={group.day} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{group.day}</h3>
            <div className="space-y-3">
              {group.items.map((notif) => (
                <Card key={notif.id} className={cn(
                  "p-5 hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden",
                  notif.isNew && "border-emerald-100 bg-emerald-50/20"
                )}>
                  <div className="flex gap-5">
                    {/* Icon Container */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      notif.type === 'user' && "bg-blue-50 text-blue-500",
                      notif.type === 'system' && "bg-rose-50 text-rose-500",
                      notif.type === 'approval' && "bg-amber-50 text-amber-500",
                    )}>
                      {notif.type === 'user' && <UserPlus size={22} />}
                      {notif.type === 'system' && <AlertCircle size={22} />}
                      {notif.type === 'approval' && <ShieldCheck size={22} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-primary group-hover:text-emerald-600 transition-colors">
                          {notif.title}
                        </h4>
                        {notif.isNew && (
                          <Badge variant="warning" className="h-2 w-2 rounded-full p-0 flex items-center justify-center animate-pulse" title="New">
                             <span className="sr-only">New</span>
                          </Badge>
                        )}
                        {notif.isNew && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">New</span>}
                      </div>

                      <p className="text-sm text-slate-600">
                        {notif.recipient && <span className="font-bold text-primary">{notif.recipient} </span>}
                        {notif.description || (notif.type === 'user' ? "created a caregiver profile" : "")}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock size={14} /> {notif.time}
                        </span>
                        {notif.action && (
                          <button className="text-xs font-bold text-emerald-600 hover:underline">
                            {notif.action}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between items-end">
                       <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary">
                         <MoreVertical size={18} />
                       </Button>
                       <ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
