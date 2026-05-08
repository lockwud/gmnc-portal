"use client";

import * as React from "react";
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export const EmailVerification = () => {
  const router = useRouter();
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(59);
  const [canResend, setCanResend] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled or next empty
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(59);
    // Add resend logic here
    console.log("Resending verification code...");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Mock API call
    setTimeout(() => {
      if (code === "123456") {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError("Invalid verification code. Please try again.");
        setIsLoading(false);
      }
    }, 1500);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-emerald-500 w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h3>
        <p className="text-slate-500 font-medium mb-8">
          Your email has been successfully verified. Redirecting you to your dashboard...
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 border border-slate-100"
    >
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Mail className="text-emerald-600 w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h3>
        <p className="text-slate-500 text-sm font-medium px-4">
          We've sent a 6-digit verification code to <span className="text-slate-900 font-bold">user@example.com</span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/20 group hover:scale-[1.01] active:scale-[0.99] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <>
              Verify Account
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium mb-2">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`flex items-center gap-2 mx-auto font-bold text-sm transition-colors ${
              canResend ? "text-emerald-600 hover:text-emerald-700" : "text-slate-300 cursor-not-allowed"
            }`}
          >
            <RefreshCw size={16} className={!canResend ? "" : "animate-spin-slow"} />
            {canResend ? "Resend Code" : `Resend in ${timer}s`}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
