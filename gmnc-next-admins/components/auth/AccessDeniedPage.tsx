"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlertIcon, ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-rose-50 p-6 text-rose-500 shadow-lg shadow-rose-100/50">
            <ShieldAlertIcon className="h-16 w-16" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-slate-900">Access Denied</h1>
        <p className="mb-8 font-medium text-slate-500">You don&apos;t have the required permissions to access this page. Please contact your administrator if you believe this is an error.</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link href="/login" className="w-full rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-600 transition-all hover:bg-slate-50">
            Sign in as different user
          </Link>
        </div>
      </motion.div>
    </div>
  );
}