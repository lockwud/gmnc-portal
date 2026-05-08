"use client";

import * as React from "react";
import {
  UserPlus,
  AlertCircle,
  ShieldCheck,
  Clock,
  MoreVertical,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const notifications = [
  {
    day: "Today",
    items: [
      {
        id: 1,
        title: "New caregiver registered",
        recipient: "Tijani Dromo",
        time: "7:15 PM",
        type: "user",
        isNew: true,
      },
      {
        id: 2,
        title: "System alert",
        description: "A session API failed at 07:23 AM",
        time: "07:23 AM",
        type: "system",
        isNew: true,
      },
      {
        id: 3,
        title: "Therapist awaiting approval",
        recipient: "Daniela Bawuah",
        description: "submitted their credentials for review",
        time: "7:15 PM",
        type: "approval",
        isNew: true,
        action: "Review now",
      },
    ],
  },
  {
    day: "Yesterday",
    items: [
      {
        id: 4,
        title: "New caregiver registered",
        recipient: "Tijani Dromo",
        time: "7:15 PM",
        type: "user",
        isNew: false,
      },
    ],
  },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Notifications</h1>
          <p className="mt-1 text-slate-500">
            Stay updated with system activities and administrative tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gray" className="gap-2 border border-slate-200 bg-white text-slate-700">
            <Filter size={18} /> Filters
          </Button>

          <Button
            variant="gray"
            className="font-bold text-emerald-600 hover:bg-emerald-50"
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        {notifications.map((group) => (
          <div key={group.day} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              {group.day}
            </h3>

            <div className="space-y-3">
              {group.items.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden p-5 transition-all hover:border-slate-300",
                    notification.isNew && "border-emerald-100 bg-emerald-50/20"
                  )}
                >
                  <div className="flex gap-5">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        notification.type === "user" && "bg-blue-50 text-blue-500",
                        notification.type === "system" && "bg-rose-50 text-rose-500",
                        notification.type === "approval" && "bg-amber-50 text-amber-500"
                      )}
                    >
                      {notification.type === "user" && <UserPlus size={22} />}
                      {notification.type === "system" && <AlertCircle size={22} />}
                      {notification.type === "approval" && <ShieldCheck size={22} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-primary transition-colors group-hover:text-emerald-600">
                          {notification.title}
                        </h4>

                        {notification.isNew && (
                          <>
                            <Badge
                              color="yellow"
                              className="flex h-2 w-2 items-center justify-center rounded-full p-0 animate-pulse"
                            >
                              <span className="sr-only">New</span>
                            </Badge>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600">
                              New
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-slate-600">
                        {notification.recipient && (
                          <span className="font-bold text-primary">{notification.recipient} </span>
                        )}
                        {notification.description ||
                          (notification.type === "user" ? "created a caregiver profile" : "")}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Clock size={14} /> {notification.time}
                        </span>

                        {notification.action && (
                          <button className="text-xs font-bold text-emerald-600 hover:underline">
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="gray"
                        className="min-h-0 bg-transparent p-2 text-slate-300 shadow-none hover:bg-slate-50 hover:text-primary"
                      >
                        <MoreVertical size={18} />
                      </Button>

                      <ChevronRight
                        size={18}
                        className="text-slate-200 transition-colors group-hover:text-emerald-400"
                      />
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
