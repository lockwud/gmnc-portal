"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileCheck2 } from "lucide-react";

import { AuthBackground } from "@/components/auth/AuthBackground";
import { useAuth } from "@/lib/context/AuthContext";

/**
 * Versioned Terms + Privacy Policy re-acceptance (backend Group 3).
 * Shown when login or /auth/me reports terms.reacceptanceRequired — the
 * platform documents moved past what the user last accepted. Both boxes
 * must be checked; versions are pinned server-side to the live documents.
 */
export default function AcceptTermsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const terms = user?.terms ?? null;
  const canSubmit = acceptedTerms && acceptedPrivacy && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/user/accept-terms', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ acceptedTerms: true, acceptedPrivacyPolicy: true }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not record your acceptance');
      }
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record your acceptance');
    } finally {
      setSubmitting(false);
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
        <div className="hidden overflow-hidden px-6 py-8 lg:flex lg:flex-col lg:justify-center">
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <FileCheck2 size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Updated terms</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                One quick step
              </p>
            </div>
          </div>
          <p className="relative z-10 mt-8 max-w-sm text-sm font-medium leading-relaxed text-slate-600">
            Our Terms of Use
            {terms?.liveTermsVersion ? ` (v${terms.liveTermsVersion})` : ''} and Privacy
            Policy{terms?.livePrivacyPolicyVersion ? ` (v${terms.livePrivacyPolicyVersion})` : ''} have
            been updated since you last accepted them. Please review and re-accept to continue.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? 'Checking…' : 'Please re-accept'}
            </h3>
            <p className="mb-6 text-sm font-medium text-slate-500">
              {terms && !terms.reacceptanceRequired
                ? 'Your acceptance is already up to date — you can go back to your dashboard.'
                : 'Our Terms and Privacy Policy changed. Tick both boxes to continue using the portal.'}
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600">
                <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    I accept the Terms of Use{terms?.liveTermsVersion ? ` (v${terms.liveTermsVersion})` : ''}
                  </span>
                  <span className="block text-xs text-slate-500">Required to keep using the platform.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    I accept the Privacy Policy{terms?.livePrivacyPolicyVersion ? ` (v${terms.livePrivacyPolicyVersion})` : ''}
                  </span>
                  <span className="block text-xs text-slate-500">How we handle patient and account data.</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  'Accept & continue'
                )}
              </button>

              {terms && !terms.reacceptanceRequired && (
                <button
                  type="button"
                  onClick={() => router.replace('/dashboard')}
                  className="h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Back to dashboard
                </button>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </AuthBackground>
  );
}
