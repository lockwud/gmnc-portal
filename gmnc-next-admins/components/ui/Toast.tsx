'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastOptions = {
  title?: string;
  message: string;
  duration?: number;
  proceedLabel?: string;
  dismissLabel?: string;
  onProceed?: () => void;
  onDismiss?: () => void;
};

type ToastContextValue = {
  show: (opts: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ToastOptions | null>(null);
  const timerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const show = useCallback((o: ToastOptions) => {
    setOpts(o);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (o.duration && o.duration > 0) {
      timerRef.current = window.setTimeout(() => setOpts(null), o.duration);
    }
  }, []);

  const hide = useCallback(() => {
    setOpts(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const toastMarkup = opts ? (
    <div aria-live="polite" className="fixed top-6 right-6 z-50 pointer-events-none">
      <div className="pointer-events-auto max-w-sm w-full bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="flex items-start gap-3 p-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {opts.title && <div className="text-sm font-medium text-gray-900">{opts.title}</div>}
            <div className="mt-0.5 text-sm text-gray-700">{opts.message}</div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => { opts.onProceed?.(); hide(); }}
                className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm shadow-sm hover:bg-blue-700 transition"
              >
                {opts.proceedLabel ?? 'Proceed'}
              </button>

              <button
                onClick={() => { opts.onDismiss?.(); hide(); }}
                className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                {opts.dismissLabel ?? 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {mounted && toastMarkup ? createPortal(toastMarkup, document.body) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}