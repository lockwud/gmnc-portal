"use client";

import * as React from "react";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck,
  SearchIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const contacts = [
  { id: 1, name: "Dr. Louisa Parker", lastMsg: "The patient report is ready...", time: "10:30 AM", unread: 2, online: true },
  { id: 2, name: "Tijani Dromo", lastMsg: "Did you verify the document?", time: "09:15 AM", unread: 0, online: true },
  { id: 3, name: "Samuel Aboagye", lastMsg: "I'll be out for the next hour.", time: "Yesterday", unread: 0, online: false },
  { id: 4, name: "Beryl Mensah", lastMsg: "Please check the support ticket #441", time: "Yesterday", unread: 5, online: false },
];

const initialMessages = [
  { id: 1, sender: "other", text: "Hello Admin, I need to share the sensitive patient data for CP-882-001.", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Go ahead, Louisa. The system will automatically mask it until verified.", time: "10:31 AM" },
  { id: 3, sender: "other", text: "Patient SSN: [MASKED]", isSensitive: true, maskedValue: "XXX-XX-XXXX", realValue: "123-45-6789", time: "10:32 AM" },
  { id: 4, sender: "other", text: "Residential Address: [MASKED]", isSensitive: true, maskedValue: "Click to reveal", realValue: "123 Healthcare Ave, Accra", time: "10:32 AM" },
];

export default function InboxPage() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Mock password
      setIsUnlocked(true);
      setShowPrompt(false);
      setPassword("");
      setError("");
      
      // Auto-lock after 1 minute for safety
      setTimeout(() => setIsUnlocked(false), 60000);
    } else {
      setError("Invalid administrative credentials.");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="h-[calc(100vh-160px)] flex gap-6">
        {/* Sidebar: Contacts */}
        <Card className="w-80 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-primary mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Search chats..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className={cn(
                  "p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-50 last:border-0",
                  contact.id === 1 ? "bg-accent/5 border-l-4 border-accent" : "hover:bg-slate-50"
                )}
              >
                <div className="relative h-12 w-12 shrink-0">
                  <div className="h-full w-full rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                  {contact.online && (
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-primary truncate text-sm">{contact.name}</h4>
                    <span className="text-[10px] text-slate-400">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{contact.lastMsg}</p>
                </div>
                {contact.unread > 0 && (
                  <Badge variant="warning" className="h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px]">
                    {contact.unread}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Main: Chat View */}
        <Card className="flex-1 flex flex-col overflow-hidden relative">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold">L</div>
              <div>
                <h3 className="font-bold text-primary text-sm">Dr. Louisa Parker</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-600">Active Now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Button 
                  variant={isUnlocked ? "success" : "outline"} 
                  size="sm" 
                  className="gap-2 text-xs font-bold h-9"
                  onClick={() => isUnlocked ? setIsUnlocked(false) : setShowPrompt(true)}
                >
                {isUnlocked ? <ShieldCheck size={14} /> : <Lock size={14} />}
                {isUnlocked ? "SECURE SESSION ACTIVE" : "UNLOCK SENSITIVE DATA"}
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 h-9 w-9">
                <MoreVertical size={18} />
              </Button>
            </div>
          </div>

          {/* Messages Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[70%]",
                  msg.sender === "me" ? "ml-auto items-end" : "items-start"
                )}
              >
                <div 
                  className={cn(
                    "p-4 rounded-2xl text-sm relative transition-all duration-300",
                    msg.sender === "me" 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm",
                    msg.isSensitive && !isUnlocked && "blur-[2px] select-none hover:blur-0 cursor-pointer"
                  )}
                  onClick={() => msg.isSensitive && !isUnlocked && setShowPrompt(true)}
                >
                  {msg.isSensitive ? (
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        <Lock size={10} /> Sensitive Data
                      </span>
                      <span className="font-mono text-xs">
                        {isUnlocked ? msg.realValue : msg.maskedValue}
                      </span>
                    </div>
                  ) : (
                     msg.text
                  )}
                  
                  {msg.isSensitive && !isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                       <Lock size={16} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
             <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent transition-all">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                  <Paperclip size={18} />
                </Button>
                <input 
                  placeholder="Type your secure message..." 
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                />
                <Button variant="amber" size="icon" className="h-10 w-10 rounded-xl shadow-lg shadow-accent/20">
                  <Send size={18} />
                </Button>
             </div>
          </div>

          {/* Password Prompt Overlay */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl mx-auto flex items-center justify-center text-accent">
                      <Lock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-primary">Verify Credentials</h3>
                    <p className="text-sm text-slate-500">Enter your admin password to reveal sensitive data across the portal.</p>
                  </div>

                  <form onSubmit={handleUnlock} className="space-y-4">
                    <Input 
                      placeholder="Enter admin password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={error}
                      autoFocus
                    />
                    <div className="flex gap-2 pt-2">
                      <Button type="button" variant="ghost" className="flex-1 h-11" onClick={() => setShowPrompt(false)}>Cancel</Button>
                      <Button type="submit" variant="amber" className="flex-1 h-11 font-bold">Unlock Access</Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
