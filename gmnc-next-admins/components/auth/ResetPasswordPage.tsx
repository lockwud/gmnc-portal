"use client";

import * as React from "react";
import { Lock, Eye, EyeOff, CheckCircle2, MoveRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AuthBackground } from "@/components/auth/AuthBackground";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
    { label: "One special character", valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.valid).length;
  const colors = ["bg-rose-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colors[score - 1] : "bg-slate-100"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-400">
          Strength:{" "}
          <span
            className={
              score >= 3
                ? "text-emerald-600"
                : score >= 2
                ? "text-amber-600"
                : "text-rose-600"
            }
          >
            {labels[score - 1] ?? "Weak"}
          </span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {checks.map(({ label, valid }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${valid ? "bg-emerald-500" : "bg-slate-200"}`}
            />
            <span
              className={`text-[10px] font-medium ${valid ? "text-emerald-600" : "text-slate-400"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isWeak = password.length > 0 && password.length < 8;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Failed to reset password. Please try again.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthBackground>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 p-10 text-center shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-100"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-2xl font-bold tracking-tight text-slate-900"
          >
            Password Updated!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 text-sm font-medium leading-relaxed text-slate-500"
          >
            Your credentials have been reset. <br /> Redirecting you to login…
          </motion.p>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5 }}
              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
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
                Access <span className="text-emerald-600">Regained.</span>
                <br />
                Security first.
              </h2>
              <div className="mt-6 h-1.5 w-20 rounded-full bg-emerald-500" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-sm text-sm font-medium leading-relaxed text-slate-600"
            >
              Set your new credentials and get back to managing what matters
              most — patient care.
            </motion.p>

            {/* Security tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Password Tips
                </span>
              </div>
              <ul className="space-y-1.5">
                {[
                  "Use at least 8 characters",
                  "Mix uppercase and lowercase letters",
                  "Add numbers and special symbols",
                  "Avoid using personal information",
                ].map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-xs font-medium text-slate-600"
                  >
                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            <div className="mb-8">
              <motion.h3
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-2 text-3xl font-bold tracking-tight text-slate-900"
              >
                New Password
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium text-slate-500"
              >
                Choose a strong, unique password for your account.
              </motion.p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="relative">
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
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
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="relative">
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock size={18} className="text-slate-400" />}
                    className={`h-11 rounded-xl bg-white font-medium ${
                      passwordMismatch
                        ? "border-rose-300"
                        : "border-slate-200"
                    }`}
                    error={passwordMismatch ? "Passwords do not match" : undefined}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-emerald-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border-none bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    isLoading || passwordMismatch || isWeak || !password || !confirmPassword
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Updating…</span>
                    </div>
                  ) : (
                    <>
                      Complete Reset
                      <MoveRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </motion.div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white px-4 py-0.5">Secure Reset</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </AuthBackground>
  );
}