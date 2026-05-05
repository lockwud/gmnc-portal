"use client";

import * as React from "react";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock reset delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      // Automatically redirect after success
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <AuthBackground>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-md glass rounded-[3rem] border-white/40 shadow-premium p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl -ml-16 -mt-16" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-16 rounded-3xl bg-white/50 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/60 shadow-sm"
          >
             <CheckCircle2 className="text-emerald-500 w-8 h-8" />
          </motion.div>

          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-primary mb-1 tracking-tight"
          >
            Password Updated!
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 mb-8 leading-relaxed font-medium text-xs"
          >
            Your credentials have been reset. <br /> Redirecting you to login...
          </motion.p>
          
          <div className="w-full bg-slate-100/50 h-1.5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2 }}
               className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
             />
          </div>
        </motion.div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative"
      >
        {/* Brand Side - Glass Texture */}
        <div className="hidden lg:flex flex-col justify-around p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 relative z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-white/60 shadow-sm">
               <img src="/logo.png" alt="GmNC Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary tracking-tight">GmNC</h1>
              <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">getmyneurocare</p>
            </div>
          </motion.div>

          <div className="space-y-8 relative z-10">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
             >
               <h2 className="text-3xl font-extrabold leading-[1.1] text-primary tracking-tight">
                 Access <span className="text-emerald-600">Regained</span>. <br /> Security first.
               </h2>
               <div className="h-1.5 w-20 bg-emerald-500 rounded-full mt-4" />
             </motion.div>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="text-slate-600 text-base leading-relaxed max-w-sm font-medium"
             >
                Set your new credentials and get back to managing what matters most.
             </motion.p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-6 lg:p-10 flex flex-col justify-center relative">
          <div className="mb-6 text-center lg:text-left">
            <motion.h3 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-primary mb-1 tracking-tight"
            >
              Reset Password
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 text-sm font-medium"
            >
              Choose a strong, unique password.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <div className="relative">
                <Input 
                  label="New Password" 
                  placeholder="Enter new password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={20} className="text-slate-400" />}
                  className="rounded-xl h-11 bg-white/50 focus:bg-white border-slate-200/60 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Input 
                label="Confirm Password" 
                placeholder="Confirm your new password" 
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={20} className="text-slate-400" />}
                className="rounded-xl h-11 bg-white/50 focus:bg-white border-slate-200/60 transition-all font-medium"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                type="submit"
                variant="amber" 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-xl shadow-accent/20 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                disabled={isLoading || password !== confirmPassword || password.length < 6}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Reset
                    <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </AuthBackground>
  );
}
