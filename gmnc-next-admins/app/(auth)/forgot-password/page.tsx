"use client";

import * as React from "react";
import { Mail, ArrowLeft, ArrowRight, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock request delay
    setTimeout(() => {
      router.push("/check-email");
    }, 1200);
  };

  return (
    <AuthBackground>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 relative"
      >
        {/* Brand Side - Glass Texture */}
        <div className="hidden lg:flex flex-col justify-around p-8 relative overflow-hidden">
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
                 Secure <span className="text-emerald-600">Recovery</span> <br /> starts here.
               </h2>
               <div className="h-1 w-16 bg-emerald-500 rounded-full mt-3" />
             </motion.div>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="text-slate-600 text-sm leading-relaxed max-w-sm font-medium"
             >
                Lost your access? We've got you covered with industrial-grade security protocols.
             </motion.p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-6 lg:p-10 flex flex-col justify-center  relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              href="/login" 
              className="absolute top-6 left-6 lg:left-10 text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </motion.div>

          <div className="mb-6 mt-8 text-center lg:text-left">
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
              Enter email to receive recovery instructions.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Input 
                label="Registered Email" 
                placeholder="Enter email address" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} className="text-slate-400" />}
                className="rounded-xl h-11 bg-white/50 focus:bg-white border-slate-200/60 transition-all font-medium"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button 
                type="submit"
                variant="amber" 
                className="w-full h-11 rounded-xl text-base font-bold shadow-xl shadow-accent/20 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Recovery Link
                    <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-tight">
              Need help? <br />
              <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer transition-all">Support Center</span>
            </p>
          </form>
        </div>
      </motion.div>
    </AuthBackground>
  );  
}
