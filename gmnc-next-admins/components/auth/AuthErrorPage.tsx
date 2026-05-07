"use client";

import * as React from "react";
import { AlertTriangle, MoveRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function AuthErrorPage() {
  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[3rem] border border-blue shadow-premium backdrop-blur-md lg:grid-cols-2"
      >
        <div className="relative hidden flex-col justify-around overflow-hidden bg-white/40 p-8 lg:flex">
          <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-white/60 bg-white p-2 shadow-sm">
              <Image src="/logo.png" alt="GmNC Logo" width={40} height={40} className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">GmNC</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">getmyneurocare</p>
            </div>
          </motion.div>

          <div className="relative z-10 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-2xl font-extrabold leading-[1.1] tracking-tight text-primary">
                Something <span className="text-rose-600">isn&apos;t right</span>. <br /> Let&apos;s fix this.
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-rose-500" />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="max-w-sm text-sm font-medium leading-relaxed text-slate-600">
              It looks like your connection has timed out or the security link has expired.
            </motion.p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center bg-white/80 p-6 text-center lg:p-10 lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-rose-100/60 bg-rose-50/50 shadow-sm backdrop-blur-sm lg:mx-0"
          >
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </motion.div>

          <motion.h3 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-1 text-2xl font-bold tracking-tight text-primary">
            Auth Error
          </motion.h3>
          <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-6 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            The session could not be validated. Please return to the login screen or contact your supervisor.
          </motion.p>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Link href="/login">
                <Button variant="amber" className="group h-11 w-full border-none bg-primary text-lg font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98] rounded-xl">
                  Return to Login
                  <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              type="button"
              onClick={() => {
                alert("Support contact form is not available in this demo.");
              }}
              className="group mx-auto flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-rose-600 lg:mx-0"
            >
              <LifeBuoy size={18} className="text-slate-400 transition-transform group-hover:rotate-12" />
              Contact Support
            </motion.button>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-4 text-[10px] font-bold leading-relaxed tracking-tight text-slate-400">
            Error Code: <span className="text-rose-600">AUTH_INVALID_SESSION</span>
          </motion.p>
        </div>
      </motion.div>
    </AuthBackground>
  );
}