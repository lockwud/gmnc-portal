"use client";

import { motion } from "framer-motion";
import React from "react";

export const AuthBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 md:p-8">
      {/* Animated Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/40 rounded-full blur-[120px] animate-blob-delayed" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] animate-blob-slow" />
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 z-[1] bg-noise pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
