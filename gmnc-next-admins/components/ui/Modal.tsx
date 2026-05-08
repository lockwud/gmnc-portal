'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const Modal: React.FC<Props> = ({ isOpen, onClose, title, children, className }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL CONTENT */}
      <div className={cn(
        "relative z-10 w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-scale-in",
        className
      )}>
        {title && (
          <div className="px-8 pt-8 pb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
