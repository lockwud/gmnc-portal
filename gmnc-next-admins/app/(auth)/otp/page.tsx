"use client";

import * as React from "react";
import { ShieldCheck, ArrowRight, RefreshCcw, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";

import { useAuth } from "@/lib/context/AuthContext";
import { getDashboardRoute } from "@/lib/rbac";

export default function OTPPage() {
  const router = useRouter();
  const { selectedRole } = useAuth();
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock verification
    setTimeout(() => {
      if (selectedRole) {
        router.push(getDashboardRoute(selectedRole));
      } else {
        router.push("/dashboard");
      }
    }, 1200);
  };

  return (
    <AuthBackground>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md backdrop-blur-md rounded border border-slate-200 p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200/20  blur-2xl -ml-16 -mt-16" />
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/60 shadow-sm"
        >
           <ShieldCheck className="text-emerald-500 w-7 h-7" />
        </motion.div>

        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-primary mb-3 tracking-tight"
        >
          Verify Account
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 mb-6 leading-relaxed font-medium text-xs"
        >
          A 6-digit code was sent to your email. <br /> Please enter it below to continue.
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between gap-2"
          >
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                ref={(el) => { inputRefs.current[index] = el; }}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 text-center text-lg font-bold bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-primary shadow-sm"
              />
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <Button 
              type="submit"
              variant="amber" 
              className="w-full h-11 rounded-xl text-base font-bold shadow-xl shadow-accent/20 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              disabled={isLoading || otp.join("").length < 6}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify Access
                  <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <button 
              type="button" 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  alert("A new OTP code has been sent!");
                }, 1000);
              }}
              className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors mx-auto group uppercase tracking-widest"
            >
              <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              Resend Code
            </button>
          </motion.div>
        </form>
      </motion.div>
    </AuthBackground>
  );
}
