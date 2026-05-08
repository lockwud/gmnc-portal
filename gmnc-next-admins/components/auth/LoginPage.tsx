"use client";

import * as React from "react";
import { Mail, Lock, Eye, EyeOff, MoveRight } from "lucide-react";
import  Button  from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <AuthBackground>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 relative">
        <div className="hidden lg:flex flex-col justify-around p-8 relative overflow-hidden">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-sm border border-slate-100 relative overflow-hidden">
              <Image src="/logo.png" alt="GmNC Logo" fill sizes="56px" className="object-contain p-2" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GmNC</h1>
              <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">getmyneurocare</p>
            </div>
          </motion.div>

          <div className="space-y-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-4xl font-extrabold leading-[1.1] text-slate-900 tracking-tight">
                Empowering <span className="text-emerald-600">Clinical Focus</span> <br /> through digital innovation.
              </h2>
              <div className="h-1.5 w-20 bg-emerald-500 rounded-full mt-6" />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-slate-600 text-sm leading-relaxed max-w-sm font-medium">
              The multidisciplinary platform for high-fidelity rehabilitation of children with Cerebral Palsy.
            </motion.p>
          </div>
        </div>

        <div className="p-6 lg:p-10 flex flex-col justify-center relative">
          <div className="mb-10">
            <motion.h3 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Sign In
            </motion.h3>
            <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="text-slate-500 text-sm font-medium">
              Welcome back! Access your workspace.
            </motion.p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Input
                label="Email address"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} className="text-slate-400" />}
                className="rounded-2xl h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all font-medium"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <div className="relative">
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={20} className="text-slate-400" />}
                  className="rounded-2xl h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all font-medium"
                  required
                />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-slate-400 hover:text-emerald-500 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all" />
                <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-emerald-600 font-bold hover:underline">
                Forgot password?
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <button type="submit" className="w-full h-12 rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/20 group hover:scale-[1.01] active:scale-[0.99] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    Sign In to Portal
                    <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold text-slate-400">
                <span className="bg-white px-4 py-0.5">Secure Access</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all font-bold text-xs text-slate-600 shadow-sm">
                <Image src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width={16} height={16} unoptimized />
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all font-bold text-xs text-slate-600 shadow-sm">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" width={16} height={16} unoptimized />
                Microsoft
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AuthBackground>
  );
}