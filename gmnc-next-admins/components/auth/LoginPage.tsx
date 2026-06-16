"use client";

import * as React from "react";
import { Mail, Lock, Eye, EyeOff, MoveRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "@/lib/context/ThemeContext";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const { preferences, isDark } = useTheme();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(identifier, password);
  };

  React.useEffect(() => {
    const root = document.documentElement;
    // Login page always uses light mode or follows system preference,
    // ignoring any previously stored dark mode preference
    root.classList.remove('dark');

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (preferences.themeMode === 'system') {
        e.matches ? root.classList.add('dark') : root.classList.remove('dark');
      }
    };

    // For system mode, respect the system preference on the login page
    if (preferences.themeMode === 'system' && darkModeQuery.matches) {
      root.classList.add('dark');
    }

    darkModeQuery.addEventListener('change', handleSystemChange);
    return () => {
      darkModeQuery.removeEventListener('change', handleSystemChange);
    };
  }, [preferences.themeMode]);

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative grid w-full max-w-4xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
      >
        {/* Branding Panel */}
        <div className="hidden overflow-hidden px-6 py-8 lg:flex lg:flex-col lg:justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex items-center gap-4"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
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
                Empowering <span className="text-emerald-600">Clinical Focus</span>
                <br />
                through digital
                <br />
                innovation.
              </h2>
              <div className="mt-6 h-1.5 w-20 rounded-full bg-emerald-500" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-sm text-sm font-medium leading-relaxed text-slate-600"
            >
              The multidisciplinary platform for high-fidelity rehabilitation of
              children with Cerebral Palsy.
            </motion.p>
          </div>
        </div>

        {/* Form Card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            <div className="mb-8">
              <motion.h3
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-2 text-3xl font-bold tracking-tight text-slate-900"
              >
                Welcome Back
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium text-slate-500"
              >
                Access your dashboard
              </motion.p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Input
                  label="Email Address"
                  placeholder="Enter your email or phone number"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  icon={<Mail size={18} className="text-slate-400" />}
                  className="h-11 rounded-xl border-slate-200 bg-white font-medium"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="relative">
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={18} className="text-slate-400" />}
                    className="h-11 rounded-xl border-slate-200 bg-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between gap-4 pt-1"
              >
                <label className="group flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Remember me</span>
                    <p className="text-[11px] text-slate-400">Keep me signed in on this device</p>
                  </div>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-emerald-600 hover:underline shrink-0"
                >
                  Forgot password
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  className="group flex h-12 w-full items-center justify-center rounded-xl border-none bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>loading permissions</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white px-4 py-0.5">Secure Access</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </AuthBackground>
  );
}
