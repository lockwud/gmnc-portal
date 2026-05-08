"use client";

import * as React from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function TwoFactorPage() {
  return (
    <AuthBackground>
      <div className="w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 self-start max-w-lg mx-auto w-full px-4 flex items-center justify-between"
        >
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
             <ShieldAlert size={14} className="text-amber-500" />
             <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Highly Recommended</span>
          </div>
        </motion.div>

        <TwoFactorSetup />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Military Grade Security
          </p>
        </motion.div>
      </div>
    </AuthBackground>
  );
}
