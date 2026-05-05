'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { Role } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, ChevronDownIcon, LayoutDashboardIcon, LogOutIcon, PanelLeft, SearchIcon, ShieldCheckIcon, ShieldIcon, UserCheckIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useLayout } from '@/lib/context/LayoutContext';
import { useState } from 'react';

export function TopBar() {
  const { user, selectedRole, setSelectedRole, logout } = useAuth();
  const { toggleSidebar } = useLayout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const roleLabels: Record<Role, string> = {
    admin: 'Administrator',
    caregiver: 'Caregiver',
    provider: 'Provider',
    support: 'Support Agent',
    tester: 'Tester'
  };

  const roleIcons: Record<Role, any> = {
    admin: ShieldCheckIcon,
    caregiver: UserCheckIcon,
    provider: UserCheckIcon,
    support: LayoutDashboardIcon,
    tester: ShieldIcon
  };

  const CurrentRoleIcon = selectedRole ? roleIcons[selectedRole] : UserIcon;

  return (
    <header className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-40">

      <PanelLeft 
        onClick={toggleSidebar}
        className="text-slate-400 hover:bg-slate-50 hover:text-[#059669] rounded-lg transition-all cursor-pointer p-1.5" 
      />

      {/* Actions */}
      <div className="flex items-center gap-6 relative z-10">
        {/* Role Switcher (Only for Multi-role users) */}
        {user && user.roles.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all group"
            >
              <CurrentRoleIcon className="w-4 h-4 text-[#059669]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{roleLabels[selectedRole || user.roles[0]]}</span>
              <ChevronDownIcon className={cn("w-4 h-4 transition-transform", isRoleOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isRoleOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden"
                >
                  <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch Workspace</p>
                  {user.roles.map((role) => {
                    const Icon = roleIcons[role];
                    const isActive = selectedRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setIsRoleOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group",
                          isActive ? "bg-emerald-50 text-[#059669]" : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          isActive ? "bg-emerald-100/50" : "bg-slate-100 group-hover:bg-slate-200"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{roleLabels[role]}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{role === 'admin' ? 'Full Control' : 'Specialized Portal'}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <Link 
          href="/notifications"
          className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#059669] rounded-lg transition-all"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
               <img 
                 src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="text-left hidden lg:block pr-2">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'Loading...'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedRole || 'Guest'}</p>
            </div>
            <ChevronDownIcon className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-all text-sm font-bold">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-emerald-50 text-[#059669] transition-all text-sm font-bold"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
