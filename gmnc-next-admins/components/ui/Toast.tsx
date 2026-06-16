'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'loading' | 'info';

type ToastOptions = {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  dismissLabel?: string;
  onDismiss?: () => void;
};

type ToastContextValue = {
  show: (opts: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-700',
    icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700',
    icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    text: 'text-red-900 dark:text-red-100',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-700',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
    text: 'text-yellow-900 dark:text-yellow-100',
  },
  loading: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700',
    icon: <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />,
    text: 'text-blue-900 dark:text-blue-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700',
    icon: <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    text: 'text-blue-900 dark:text-blue-100',
  },
};

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
    // Only auto-dismiss if duration is set and type is not 'loading'
    if (o.duration && o.duration > 0 && o.type !== 'loading') {
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

  const toastType = opts?.type || 'info';
  const style = toastStyles[toastType];

  const toastMarkup = opts ? (
    <div aria-live="polite" className="fixed top-6 right-6 z-50 pointer-events-none">
      <div className={`pointer-events-auto max-w-sm w-full rounded-lg shadow-lg border ${style.bg} ${style.border} overflow-hidden`}>
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">
            {style.icon}
          </div>

          <div className="flex-1 min-w-0">
            {opts.title && <div className={`text-sm font-semibold ${style.text}`}>{opts.title}</div>}
            <div className={`mt-0.5 text-sm ${style.text} opacity-90`}>{opts.message}</div>
          </div>

          <button
            onClick={() => { opts.onDismiss?.(); hide(); }}
            className={`flex-shrink-0 ${style.text} hover:opacity-70 transition`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
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