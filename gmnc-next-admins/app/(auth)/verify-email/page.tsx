"use client";

import * as React from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <AuthBackground>
      <div className="w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 self-start max-w-md mx-auto w-full px-4"
        >
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </motion.div>

        <EmailVerification />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Secure Verification System
          </p>
        </motion.div>
      </div>
    </AuthBackground>
  );
}
