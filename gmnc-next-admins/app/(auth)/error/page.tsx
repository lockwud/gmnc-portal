"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, MoveRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function AuthErrorPage() {
  return (
    <AuthBackground>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 backdrop-blur-md rounded-[3rem] border border-blue shadow-premium overflow-hidden relative"
      >
        {/* Brand Side - Glass Texture */}
        <div className="hidden lg:flex flex-col justify-around p-8 bg-white/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
          
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
               <h2 className="text-2xl font-extrabold leading-[1.1] text-primary tracking-tight">
                 Something <span className="text-rose-600">isn't right</span>. <br /> Let's fix this.
               </h2>
               <div className="h-1 w-16 bg-rose-500 rounded-full mt-3" />
             </motion.div>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="text-slate-600 text-sm leading-relaxed max-w-sm font-medium"
             >
                It looks like your connection has timed out or the security link has expired.
             </motion.p>
          </div>
        </div>

        {/* Content Side */}
        <div className="p-6 lg:p-10 flex flex-col justify-center bg-white/80 relative text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-16 rounded-3xl bg-rose-50/50 backdrop-blur-sm flex items-center justify-center mb-6 border border-rose-100/60 shadow-sm mx-auto lg:mx-0"
          >
             <AlertTriangle className="text-rose-500 w-8 h-8" />
          </motion.div>

          <motion.h3 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-primary mb-1 tracking-tight"
          >
            Auth Error
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 text-sm mb-6 leading-relaxed max-w-md font-medium"
          >
            The session could not be validated. Please return to the login screen or contact your supervisor.
          </motion.p>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/login">
                <Button 
                  variant="amber" 
                  className="w-full h-11 rounded-xl text-lg font-bold shadow-xl shadow-accent/20 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-slate-800 text-white border-none"
                >
                  Return to Login
                  <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              type="button" 
              onClick={() => {
                alert("Support contact form is not available in this demo.");
              }}
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors mx-auto lg:mx-0 group uppercase tracking-widest"
            >
              <LifeBuoy size={18} className="text-slate-400 group-hover:rotate-12 transition-transform" />
              Contact Support
            </motion.button>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[10px] text-slate-400 mt-4 leading-relaxed font-bold tracking-tight"
          >
            Error Code: <span className="text-rose-600">AUTH_INVALID_SESSION</span>
          </motion.p>
        </div>
      </motion.div>
    </AuthBackground>
  );
}
