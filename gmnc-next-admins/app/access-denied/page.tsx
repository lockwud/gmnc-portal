'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlertIcon, ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-rose-50 text-rose-500 shadow-lg shadow-rose-100/50">
            <ShieldAlertIcon className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-500 mb-8 font-medium">
          You don't have the required permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard" 
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link 
            href="/login" 
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Sign in as different user
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
