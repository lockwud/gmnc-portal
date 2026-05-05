"use client";

import * as React from "react";
import { X, User, Phone, Mail, MapPin, Shield, CheckCircle, Ban, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ProfileSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    name: string;
    role: string;
    email: string;
    phone: string;
    region: string;
    status: string;
    id: string;
  } | null;
}

export function ProfileSlideOver({ isOpen, onClose, provider }: ProfileSlideOverProps) {
  if (!provider) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100]"
          />
          
          {/* Slide-over */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">Provider Profile</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X size={20} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Profile Card */}
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                  <User size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">{provider.name}</h3>
                  <p className="text-slate-500 font-medium">{provider.role}</p>
                </div>
                <Badge variant={provider.status === "Verified" ? "success" : "warning"} className="px-4 py-1 text-sm">
                  {provider.status}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Provider ID</p>
                    <p className="text-sm font-bold text-primary">{provider.id}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail size={18} className="text-accent" />
                      <span className="text-sm font-medium">{provider.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone size={18} className="text-accent" />
                      <span className="text-sm font-medium">{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin size={18} className="text-accent" />
                      <span className="text-sm font-medium">{provider.region}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verification Documents</h4>
                <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-700">Medical License</p>
                      <p className="text-xs text-emerald-600/70">Verified on 12/01/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-emerald-700 text-xs font-bold">View</Button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="amber" className="w-full gap-2 py-6 text-sm">
                  <CheckCircle size={18} /> Approve Verification
                </Button>
                <Button variant="outline" className="w-full gap-2 py-6 text-sm text-rose-600 border-rose-100 hover:bg-rose-50">
                  <Ban size={18} /> Reject / Suspend
                </Button>
              </div>
              <Button variant="ghost" className="w-full gap-2 text-slate-400 py-4 hover:text-primary">
                <Mail size={18} /> Send Warning Message
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
