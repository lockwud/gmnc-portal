"use client";

import * as React from "react";
import { MailCheck, RefreshCcw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [isResending, setIsResending] = React.useState(false);
  const [resendSent, setResendSent] = React.useState(false);
  const [resendError, setResendError] = React.useState<string | null>(null);

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setResendError(null);
    setResendSent(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setResendError(data.message ?? "Failed to resend. Please try again.");
      } else {
        setResendSent(true);
      }
    } catch {
      setResendError("Unable to reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

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
                Simple <span className="text-emerald-600">Recovery.</span>
                <br />
                Peace of mind.
              </h2>
              <div className="mt-6 h-1.5 w-20 rounded-full bg-emerald-500" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-sm text-sm font-medium leading-relaxed text-slate-600"
            >
              Getting back into your clinical dashboard is secure and
              straightforward. Check your inbox and follow the link.
            </motion.p>

            {/* Checklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              {[
                "Email sent to your registered address",
                "Link expires in 30 minutes",
                "Check spam if you don't see it",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{tip}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100"
            >
              <MailCheck className="h-8 w-8 text-emerald-500" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2 text-3xl font-bold tracking-tight text-slate-900"
            >
              Check Your Inbox
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-sm font-medium leading-relaxed text-slate-500"
            >
              A secure recovery link has been sent
              {email ? (
                <>
                  {" "}
                  to{" "}
                  <span className="font-bold text-slate-700">{email}</span>
                </>
              ) : null}
              . Click it to reset your access in seconds.
            </motion.p>

            {/* Resend feedback */}
            {resendSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-700"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Recovery link resent successfully!
              </motion.div>
            )}

            {resendError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                {resendError}
              </motion.div>
            )}

            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleResend}
                disabled={isResending || !email}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border-none bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Sending…</span>
                  </div>
                ) : (
                  <>
                    <RefreshCcw
                      size={18}
                      className="transition-transform duration-500 group-hover:rotate-180"
                    />
                    Resend Recovery Link
                  </>
                )}
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/login"
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  <ArrowLeft
                    size={16}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  Back to Login
                </Link>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 text-center text-[11px] font-medium text-slate-400"
            >
              No email? Check{" "}
              <span className="font-bold text-emerald-600">Spam</span> or{" "}
              <a
                href="mailto:support@gmnc.com"
                className="font-bold text-emerald-600 hover:underline"
              >
                Contact Support
              </a>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </AuthBackground>
  );
}