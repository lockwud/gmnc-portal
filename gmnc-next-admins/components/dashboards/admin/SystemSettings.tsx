"use client";

import * as React from "react";
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Mail, 
  Database, 
  Lock, 
  Save, 
  RefreshCcw,
  Smartphone,
  Cloud,
  Zap,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TABS = [
  { id: 'general', name: 'General', icon: Globe },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'clinical', name: 'Clinical Config', icon: Zap },
  { id: 'backups', name: 'Backups', icon: Database },
];

export function SystemSettings() {
  const [activeTab, setActiveTab] = React.useState('general');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("System settings updated successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Settings className="text-emerald-500" size={28} />
             System Settings
          </h1>
          <p className="text-slate-500 text-sm font-medium">
             Global configuration for the GmNC Portal platform and medical services.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="gray" 
            className="h-12 rounded-2xl font-bold text-slate-400 gap-2"
            onClick={() => toast.success('Settings reset to default values')}
           >
              <RefreshCcw size={18} />
              Reset Defaults
           </Button>
           <Button 
            className="h-12 gap-2 px-10 rounded-2xl bg-brand hover:bg-brand-hover text-white border-none font-bold shadow-xl shadow-brand/20 transition-all"
            onClick={handleSave}
            disabled={isLoading}
           >
             {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
             Save All Changes
           </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:w-[280px] space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-[24px] border transition-all relative group",
                  activeTab === tab.id 
                    ? "bg-white border-emerald-200 shadow-lg shadow-emerald-500/5" 
                    : "bg-slate-50/50 border-transparent hover:border-slate-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-400 group-hover:text-slate-600"
                )}>
                   <Icon size={20} />
                </div>
                <span className={cn("text-sm font-bold tracking-tight", activeTab === tab.id ? "text-slate-900" : "text-slate-500")}>
                  {tab.name}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeSetting" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-10"
            >
              {activeTab === 'general' && (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Organization Profile</h3>
                    <p className="text-sm text-slate-500 mt-1">This information will be displayed on patient invoices and reports.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Organization Name">
                      <Input defaultValue="GetMyNeurocare (GmNC)" className="h-12 rounded-2xl bg-slate-50/50" />
                    </FormField>
                    <FormField label="Primary Support Email">
                      <Input defaultValue="support@getmyneurocare.org" className="h-12 rounded-2xl bg-slate-50/50" />
                    </FormField>
                    <FormField label="Portal URL">
                      <Input defaultValue="https://portal.getmyneurocare.org" className="h-12 rounded-2xl bg-slate-50/50" />
                    </FormField>
                    <Select 
                      label="Timezone" 
                      options={[{ label: '(GMT+00:00) Accra', value: 'gh' }, { label: '(GMT-05:00) New York', value: 'ny' }]} 
                      className="bg-slate-50/50"
                    />
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security & Authentication</h3>
                    <p className="text-sm text-slate-500 mt-1">Configure global security policies and session management.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                           <Lock size={24} />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-slate-900 tracking-tight">Mandatory 2FA</p>
                          <p className="text-[13px] text-slate-500 font-medium">Require all administrative and clinical staff to use Two-Factor Authentication.</p>
                        </div>
                      </div>
                      <button className="w-14 h-7 rounded-full bg-emerald-600 relative shadow-lg shadow-emerald-500/20">
                         <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField label="Session Timeout (Minutes)">
                        <Input type="number" defaultValue="30" className="h-12 rounded-2xl bg-slate-50/50" />
                      </FormField>
                      <FormField label="Password Expiry (Days)">
                        <Input type="number" defaultValue="90" className="h-12 rounded-2xl bg-slate-50/50" />
                      </FormField>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Notification Channels</h3>
                    <p className="text-sm text-slate-500 mt-1">Select how the system communicates with patients and staff.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Mail className="text-emerald-600" />
                          <span className="font-bold text-slate-900">Email Notifications</span>
                       </div>
                       <CheckCircle2 className="text-emerald-500" />
                    </div>
                    <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                       <div className="flex items-center gap-4 text-slate-400">
                          <Smartphone />
                          <span className="font-bold">SMS (Twilio)</span>
                       </div>
                       <Badge color="gray" className="font-black text-[9px] uppercase border-slate-200">Disconnected</Badge>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'backups' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">System Backups</h3>
                      <p className="text-sm text-slate-500 mt-1">Manage database snapshots and automated recovery points.</p>
                    </div>
                    <Button 
                      className="h-10 rounded-xl bg-slate-900 text-white font-bold border-none px-6"
                      onClick={() => toast.success('Manual backup process initiated')}
                    >
                       Trigger Manual Backup
                    </Button>
                  </div>
                  <div className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Cloud className="text-blue-500" />
                           <div>
                              <p className="text-sm font-bold text-slate-900">Weekly Full Backup</p>
                              <p className="text-xs text-slate-400 font-medium">Last run: 2 days ago (Size: 1.4GB)</p>
                           </div>
                        </div>
                        <Badge color="green" className="font-bold px-3">HEALTHY</Badge>
                     </div>
                     <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Database className="text-amber-500" />
                           <div>
                              <p className="text-sm font-bold text-slate-900">Real-time Replication</p>
                              <p className="text-xs text-slate-400 font-medium">Syncing with AWS S3 Virginia (us-east-1)</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                     </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
