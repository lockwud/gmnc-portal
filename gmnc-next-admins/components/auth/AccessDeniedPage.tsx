"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AccessDeniedPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-7rem)] items-center justify-center bg-slate-50 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="mb-5 flex justify-center text-slate-400">
          <span className="material-icons text-[120px] leading-none" aria-hidden>
            lock
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-950">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-400">Sorry, you do not have permission to view this page</p>
      </motion.div>
    </div>
  );
}
