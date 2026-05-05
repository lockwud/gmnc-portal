"use client";

import * as React from "react";
import { 
  Shield, 
  Bell, 
  User, 
  Lock, 
  ChevronRight,
  UserPlus,
  Mail,
  MoreVertical,
  X,
  Camera,
  LogOut,
  Info,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "team", name: "Teams", icon: Shield },
  { id: "notifications", name: "Notification", icon: Bell },
  { id: "profile", name: "Profile", icon: User },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("team");
  const [showAddUser, setShowAddUser] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Tabs */}
        <div className="lg:w-64 shrink-0 space-y-2 border-r border-slate-100 pr-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.name}
              </div>
              {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === "team" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-none bg-transparent">
                  <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="p-5 pl-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                          <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                          <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                          <th className="p-5 pr-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { name: "Blessing Naa Torshie", role: "Admin", email: "naatorshie@rapsel.com" },
                          { name: "Kwaw Nuamah", role: "Admin", email: "kwawnuamah@rapsel.com" },
                          { name: "Mubarak Salisu", role: "Admin", email: "salisumubarak@rapsel.com" },
                          { name: "Jessica Panamang", role: "Admin", email: "jessicapanamang@rapsel.com" },
                        ].map((member) => (
                          <tr key={member.email} className="hover:bg-slate-50/50 transition-all group">
                            <td className="p-5 pl-8">
                               <p className="text-sm font-bold text-primary">{member.name}</p>
                            </td>
                            <td className="p-5">
                               <Badge variant="outline" className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-none px-2 py-0.5">
                                  {member.role}
                               </Badge>
                            </td>
                            <td className="p-5">
                               <p className="text-sm text-slate-500 font-medium">{member.email}</p>
                            </td>
                            <td className="p-5 pr-8 text-right">
                               <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary">
                                 <MoreVertical size={18} />
                               </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 bg-slate-50/30 flex justify-start">
                       <Button 
                         variant="ghost" 
                         className="text-emerald-600 font-bold gap-2 pl-4"
                         onClick={() => setShowAddUser(true)}
                        >
                         <span className="text-lg">+</span> Add Teammate
                       </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-8 max-w-2xl">
                   {[
                     { 
                       title: "New user sign-ups", 
                       subtitle: "Be notified when a new therapist, caregiver or a parent creates a new account.",
                       options: ["In-app alert", "Daily email summary", "Off"]
                     },
                     { 
                       title: "Therapist approval needed", 
                       subtitle: "Be notified when a new therapist completes registration and needs validation.",
                       options: ["In-app alert", "Immediate email", "Off"]
                     },
                     { 
                       title: "Platform errors and integration failures", 
                       subtitle: "Be notified immediately of critical system errors or service disruptions.",
                       options: ["In-app alert", "Critical system alerts", "Off"]
                     }
                   ].map((section, idx) => (
                     <div key={idx} className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-primary">{section.title}</h3>
                          <p className="text-xs text-slate-500 max-w-md">{section.subtitle}</p>
                        </div>
                        <div className="space-y-3">
                           {section.options.map((option, i) => (
                             <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                  "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                                  i === 0 ? "border-emerald-500 bg-emerald-500" : "border-slate-200 group-hover:border-slate-300 bg-white"
                                )}>
                                  {i === 0 && <Check size={14} className="text-white" />}
                                </div>
                                <span className={cn(
                                  "text-xs font-bold transition-colors",
                                  i === 0 ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                                )}>{option}</span>
                             </label>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl"
              >
                {/* Profile Card */}
                <Card className="p-8 border-none shadow-sm flex items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                         <img src="https://ui-avatars.com/api/?name=Mubarak+Salisu&background=random" alt="Profile" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                           <Camera size={20} />
                         </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary">Mubarak Salisu</h3>
                        <p className="text-xs text-slate-500 font-medium">salisumubarak@rapsel.com</p>
                        <p className="text-xs text-slate-500 font-medium">+233 123 000 123</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-emerald-600 font-bold bg-emerald-50 h-10 px-6 rounded-xl" onClick={() => setShowEditProfile(true)}>
                      Edit Profile
                   </Button>
                </Card>

                {/* Account Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                     onClick={() => setShowChangePassword(true)}
                     className="p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-emerald-100 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-primary">Change password</p>
                        <p className="text-[10px] text-slate-400 max-w-[140px]">At least 8 characters with at least a symbol and a number.</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight size={18} />
                      </div>
                   </button>

                   <button className="p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-rose-100 transition-all text-left flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="font-bold text-primary">Manage account</p>
                        <p className="text-[10px] text-slate-400">Logout or deactivate account.</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                         <LogOut size={18} />
                      </div>
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddUser && (
          <Modal title="Add User" onClose={() => setShowAddUser(false)}>
             <form className="space-y-5">
                <Input label="Email" placeholder="Enter user email" />
                <div className="space-y-1.5">
                   <label className="text-sm font-bold text-primary">Role</label>
                   <select className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10">
                      <option>Select role</option>
                      <option>Admin</option>
                      <option>Editor</option>
                      <option>Viewer</option>
                   </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="ghost" className="flex-1 rounded-xl h-11" onClick={() => setShowAddUser(false)}>Cancel</Button>
                  <Button variant="amber" className="flex-1 rounded-xl h-11 font-bold">Add Teammate</Button>
                </div>
             </form>
          </Modal>
        )}

        {showEditProfile && (
           <Modal title="Edit profile" onClose={() => setShowEditProfile(false)}>
             <form className="space-y-4">
                <Input label="Name" placeholder="Type here" />
                <Input label="Email" placeholder="Type here" />
                <Input label="Phone Number" placeholder="Type here" />
                <div className="space-y-2">
                   <label className="text-sm font-bold text-primary">Profile Image</label>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <Camera size={24} />
                      </div>
                      <Button variant="ghost" className="text-rose-500 font-bold text-xs h-8 px-4">Remove</Button>
                   </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" className="flex-1 rounded-xl h-11" onClick={() => setShowEditProfile(false)}>Cancel</Button>
                  <Button variant="amber" className="flex-1 rounded-xl h-11 font-bold">Save Changes</Button>
                </div>
             </form>
           </Modal>
        )}

        {showChangePassword && (
          <Modal title="Change Password" onClose={() => setShowChangePassword(false)}>
             <form className="space-y-4">
                <Input label="Old password" placeholder="Enter password" type="password" />
                <Input label="New password" placeholder="Enter password" type="password" />
                <Input label="Confirm password" placeholder="Enter password" type="password" />
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" className="flex-1 rounded-xl h-11" onClick={() => setShowChangePassword(false)}>Cancel</Button>
                  <Button variant="amber" className="flex-1 rounded-xl h-11 font-bold">Save Changes</Button>
                </div>
             </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/20 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl space-y-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
