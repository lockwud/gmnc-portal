"use client";

import * as React from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings, 
  Share2, 
  Maximize, 
  MoreHorizontal, 
  FileText,
  Clipboard,
  Activity,
  Plus
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function TelehealthSession() {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col xl:flex-row gap-6 p-4">
      {/* Video Main Area */}
      <div className="flex-1 bg-slate-900 rounded-[40px] relative overflow-hidden flex flex-col shadow-2xl">
         {/* Top Bar (Call Info) */}
         <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-white text-xs font-bold uppercase tracking-widest">Live: Kojo Mensah (Clinical Follow-up)</span>
               <span className="text-white/40 text-xs font-bold ml-2">12:45</span>
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
               <button 
                onClick={() => toast.success('Call window expanded')}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-all"
               >
                  <Maximize size={18} />
               </button>
            </div>
         </div>

         {/* Patient Video (Mock) */}
         <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover opacity-60" 
              alt="Patient Video" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
         </div>

         {/* Doctor Video (Self View) */}
         <motion.div 
          drag
          dragConstraints={{ left: 24, top: 24, right: 24, bottom: 24 }}
          className="absolute bottom-24 right-8 w-48 h-64 bg-slate-800 rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden z-30 cursor-move group"
         >
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71f1e3c770?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover" 
              alt="Doctor Self View" 
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] text-white font-bold uppercase">You</span>
            </div>
         </motion.div>

         {/* Controls Bar */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-[32px] border border-white/10 z-40">
            <button 
              onClick={() => {
                const newState = !isMuted;
                setIsMuted(newState);
                toast.success(newState ? 'Microphone muted' : 'Microphone unmuted');
              }}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
               {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => {
                const newState = !isVideoOn;
                setIsVideoOn(newState);
                toast.success(newState ? 'Video camera enabled' : 'Video camera disabled');
              }}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                !isVideoOn ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
               {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <button 
              onClick={() => toast.success('Screen sharing started')}
              className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
            >
               <Share2 size={20} />
            </button>
            <button 
              onClick={() => toast.success('Chat panel opened')}
              className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
            >
               <MessageSquare size={20} />
            </button>
            <button 
              onClick={() => toast.success('Call settings opened')}
              className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
            >
               <Settings size={20} />
            </button>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <button 
              onClick={() => toast.error('Telehealth session ended')}
              className="h-12 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-2 shadow-xl shadow-rose-500/20 transition-all"
            >
               <PhoneOff size={20} />
               End Session
            </button>
         </div>
      </div>

      {/* Side Panel (Clinical Tools) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full xl:w-[400px] bg-white rounded-[40px] border border-slate-100 flex flex-col overflow-hidden shadow-sm"
          >
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Clinical Workspace</h3>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                   <Users size={18} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Real-time Notes */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <FileText size={14} className="text-emerald-500" />
                         Session Notes
                      </h4>
                      <Badge color="green" className="text-[8px] font-black uppercase">Auto-saving</Badge>
                   </div>
                   <textarea 
                    placeholder="Document findings during the call..."
                    className="w-full h-[200px] p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none transition-all"
                   />
                </div>

                {/* Quick Prescription */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Plus size={14} className="text-emerald-500" />
                      Add Prescription
                   </h4>
                   <div className="flex items-center gap-2">
                      <input 
                        placeholder="Search medication..."
                        className="flex-1 h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm outline-none"
                      />
                      <Button 
                        onClick={() => toast.success('Medication added to prescription list')}
                        className="h-11 rounded-xl bg-slate-900 text-white font-bold px-4 text-xs border-none"
                      >
                         Add
                      </Button>
                   </div>
                </div>

                {/* Patient Summary Widget */}
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Profile</h4>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500">Last BP</span>
                         <span className="text-sm font-black text-slate-900">120/80</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500">Condition</span>
                         <Badge color="gray" className="bg-white border-slate-200 text-[9px] font-black uppercase">Migraine</Badge>
                      </div>
                      <Button 
                        variant="gray" 
                        className="w-full h-10 rounded-xl border border-slate-200 text-xs font-bold gap-2"
                        onClick={() => toast.success('Loading full clinical records...')}
                      >
                         <Clipboard size={14} />
                         View Full Records
                      </Button>
                   </div>
                </div>
             </div>

             <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <Button 
                  onClick={() => toast.success('Encounter note submitted and synced to EMR')}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none shadow-lg shadow-emerald-500/20"
                >
                   Submit Encounter Note
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
