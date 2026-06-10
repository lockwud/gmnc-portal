"use client";

import * as React from "react";
import { AlertTriangle, MoveRight, LifeBuoy, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  AUTH_INVALID_SESSION: {
    title: "Session Expired",
    description:
      "Your session could not be validated. This usually happens when a session expires or a security token becomes invalid.",
  },
  AUTH_TOKEN_EXPIRED: {
    title: "Token Expired",
    description:
      "The authentication token has expired. Please return to the login screen to sign in again.",
  },
  AUTH_INSUFFICIENT_PERMISSIONS: {
    title: "Insufficient Permissions",
    description:
      "You don't have the required permissions to complete this action. Please contact your administrator.",
  },
  default: {
    title: "Authentication Error",
    description:
      "The session could not be validated. Please return to the login screen or contact your supervisor.",
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const rawCode = searchParams?.get("code") ?? null;
  const errorCode = rawCode ?? "default";

  const errorInfo = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default;

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative grid w-full max-w-4xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
      >
        {/* Left branding panel */}
        <div className="hidden overflow-hidden px-6 py-8 lg:flex lg:flex-col lg:justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex items-center gap-4"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
              <Image
                src="/logo.png"
                alt="GmNC Logo"
                fill
                sizes="56px"
                className="object-contain p-2"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">GMNC</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Get my neurocare
              </p>
            </div>
          </motion.div>

          <div className="relative z-10 mt-12 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
                Something{" "}
                <span className="text-rose-500">isn&apos;t right.</span>
                <br />
                Let&apos;s fix this.
              </h2>
              <div className="mt-6 h-1.5 w-20 rounded-full bg-rose-400" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-sm text-sm font-medium leading-relaxed text-slate-600"
            >
              It looks like your connection has timed out or the security
              link has expired. This is a routine security measure.
            </motion.p>

            {/* Common causes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-2"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Common Causes
              </p>
              {[
                "Session timed out due to inactivity",
                "Expired or invalid security token",
                "Opened link from another device",
                "Browser cookies were cleared",
              ].map((cause) => (
                <div key={cause} className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">{cause}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            {/* Error icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100"
            >
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2 text-3xl font-bold tracking-tight text-slate-900"
            >
              {errorInfo.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-sm font-medium leading-relaxed text-slate-500"
            >
              {errorInfo.description}
            </motion.p>

            {/* Error code badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mb-6 inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
                Error: {errorCode !== "default" ? errorCode : "AUTH_ERROR"}
              </span>
            </motion.div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/login"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border-none bg-slate-900 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01] hover:bg-slate-800 active:scale-[0.99]"
                >
                  Return to Login
                  <MoveRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  <RefreshCcw
                    size={16}
                    className="transition-transform duration-500 group-hover:rotate-180"
                  />
                  Try Again
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center"
              >
                <a
                  href="mailto:support@gmnc.com"
                  className="group mt-1 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-rose-500"
                >
                  <LifeBuoy
                    size={15}
                    className="transition-transform group-hover:rotate-12"
                  />
                  Contact Support
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthBackground>
  );
}