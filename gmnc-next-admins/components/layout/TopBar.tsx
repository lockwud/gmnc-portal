'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useUI } from '@/lib/context/UIContext';
import { Role } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, ChevronDownIcon, LayoutDashboardIcon, LogOutIcon, PanelLeft, ShieldCheckIcon, ShieldIcon, UserCheckIcon, UserIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useLayout } from '@/lib/context/LayoutContext';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: 'New caregiver registered',
    description: 'Tijani Dromo created a profile.',
    time: '2m ago',
  },
  {
    id: 2,
    title: 'System alert',
    description: 'API latency detected in Region A.',
    time: '1h ago',
  },
  {
    id: 3,
    title: 'Approval required',
    description: 'Dr. Louisa Parker submitted docs.',
    time: '3h ago',
  },
];

export function TopBar() {
  const { user, selectedRole, setSelectedRole, logout } = useAuth();
  const { isNotificationsOpen, setNotificationsOpen } = useUI();
  const { toggleSidebar } = useLayout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  const roleLabels: Record<Role, string> = {
    admin: 'Administrator',
    caregiver: 'Caregiver',
    provider: 'Provider',
    support: 'Support Agent',
    tester: 'Tester'
  };

  const roleIcons: Record<Role, LucideIcon> = {
    admin: ShieldCheckIcon,
    caregiver: UserCheckIcon,
    provider: UserCheckIcon,
    support: LayoutDashboardIcon,
    tester: ShieldIcon
  };

  const CurrentRoleIcon = selectedRole ? roleIcons[selectedRole] : UserIcon;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsRoleOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [setNotificationsOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsRoleOpen(false);
        setNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen || isProfileOpen || isRoleOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationsOpen, isProfileOpen, isRoleOpen, setNotificationsOpen]);

  return (
    <>
      <header className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-40">

        <PanelLeft 
          onClick={toggleSidebar}
          className="text-slate-400 hover:bg-slate-50 hover:text-[#059669] rounded-lg transition-all cursor-pointer p-1.5" 
        />

        {/* Actions */}
        <div ref={controlsRef} className="flex items-center gap-6 relative z-10">
          {/* Role Switcher (Only for Multi-role users) */}
          {user && user.roles.length > 1 && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleOpen((open) => !open);
                  setIsProfileOpen(false);
                  setNotificationsOpen(false);
                }}
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

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
              setIsRoleOpen(false);
            }}
            className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#059669] rounded-lg transition-all"
            title="Notifications"
            aria-haspopup="dialog"
            aria-expanded={isNotificationsOpen}
            aria-label="Open notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen((open) => !open);
                setIsRoleOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                <Image
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="Avatar"
                  width={40}
                  height={40}
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

      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex"
            aria-modal="true"
            role="dialog"
            aria-labelledby="notifications-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setNotificationsOpen(false)}
              aria-label="Close notifications"
            />

            <motion.aside
              initial={{ x: 64, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 64, opacity: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative ml-auto h-full w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              <div className="px-5 py-4 flex items-start justify-between border-b border-slate-100">
                <div>
                  <h2 id="notifications-title" className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500">Recent alerts across your workspace.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close notifications panel"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-xs text-slate-500 leading-5">{notification.description}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
