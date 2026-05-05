"use client";

import * as React from "react";
import { MailCheck, ArrowLeft, RefreshCcw, MoveRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock resend delay then navigate to reset page for demo flow
    setTimeout(() => {
      setIsLoading(false);
      router.push("/reset-password");
    }, 1200);
  };

  return (
    <AuthBackground>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative"
      >
        {/* Brand Side - Glass Texture */}
        <div className="hidden lg:flex flex-col justify-around p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
          
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
               <h2 className="text-4xl font-extrabold leading-[1.1] text-primary tracking-tight">
                 Simple <span className="text-emerald-600">Recovery</span>. <br /> Piece of mind.
               </h2>
               <div className="h-1.5 w-20 bg-emerald-500 rounded-full mt-6" />
             </motion.div>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="text-slate-600 text-lg leading-relaxed max-w-sm font-medium"
             >
                Getting back into your clinical dashboard is secure and straightforward.
             </motion.p>
          </div>
        </div>

        {/* Content Side */}
        <div className="p-8 lg:p-12 flex flex-col justify-center relative text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-16 rounded-3xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto lg:mx-0"
          >
             <MailCheck className="text-emerald-500 w-8 h-8" />
          </motion.div>

          <motion.h3 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-primary mb-1 tracking-tight"
          >
            Check Inbox
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 text-sm mb-4 leading-relaxed max-w-md font-medium"
          >
            A secure recovery link has been sent. Click it to reset your access in seconds.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative group"
            >
              <Input 
                placeholder="Enter your email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} className="text-slate-400" />}
                className="rounded-xl h-11 bg-white/50 focus:bg-white border-slate-200/60 transition-all font-medium"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Button 
                type="submit"
                variant="amber" 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-xl shadow-accent/20 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Recovery Link
                    <RefreshCcw size={18} className="ml-2 group-hover:rotate-180 transition-transform duration-500" />
                  </>
                )}
              </Button>

              <Link href="/login" className="block">
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full h-11 rounded-xl text-slate-500 font-bold hover:bg-white/60 transition-all gap-2"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          </form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-[10px] text-slate-400 mt-6 leading-relaxed font-bold uppercase tracking-tight"
          >
            No email? Check <span className="text-emerald-600">Spam</span> or <span className="text-emerald-600 cursor-pointer hover:underline">Contact Admin</span>
          </motion.p>
        </div>
      </motion.div>
    </AuthBackground>
  );
}
