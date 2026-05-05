'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useLayout } from '@/lib/context/LayoutContext';
import { Permission } from '@/lib/rbac';
import { 
  LayoutDashboardIcon, 
  CalendarIcon, 
  UsersIcon, 
  ActivityIcon,
  MessageSquareIcon,
  StethoscopeIcon,
  SettingsIcon, 
  HelpCircleIcon,
  LogOutIcon,
  ShieldAlertIcon,
  ServerIcon,
  UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: any;
  href: string;
  permission?: Permission;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Overview', icon: LayoutDashboardIcon, href: '/dashboard' },
      { label: 'Admin Dashboard', icon: ShieldAlertIcon, href: '/admin', permission: 'system.manage' },
      { label: 'Caregiver Dashboard', icon: UserIcon, href: '/caregiver', permission: 'caregiver.read' },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'User Management', icon: UsersIcon, href: '/admin/users', permission: 'system.manage' },
      { label: 'Roles & Access', icon: ShieldAlertIcon, href: '/admin/roles', permission: 'system.manage' },
      { label: 'Audit Viewer', icon: ActivityIcon, href: '/admin/audit', permission: 'system.manage' },
      { label: 'Referral Campaigns', icon: UsersIcon, href: '/admin/referrals', permission: 'system.manage' },
      { label: 'Integrations', icon: ServerIcon, href: '/admin/integrations', permission: 'system.manage' },
    ]
  },
  {
    title: 'CLINICAL OPERATIONS',
    items: [
      { label: 'Appointments', icon: CalendarIcon, href: '/provider/appointments', permission: 'appointment.read' },
      { label: 'Patient List', icon: UsersIcon, href: '/provider/clients', permission: 'appointment.read' },
      { label: 'Referral Track', icon: MessageSquareIcon, href: '/provider/referrals', permission: 'appointment.read' },
      { label: 'Tasks & Notes', icon: CalendarIcon, href: '/provider/tasks', permission: 'appointment.read' },
      { label: 'Provider Network', icon: StethoscopeIcon, href: '/admin/providers', permission: 'system.manage' },
    ]
  },
  {
    title: 'PATIENT PORTAL',
    items: [
      { label: 'Telehealth', icon: MessageSquareIcon, href: '/caregiver/telehealth', permission: 'caregiver.read' },
      { label: 'Games & Well-being', icon: ActivityIcon, href: '/caregiver/games', permission: 'caregiver.read' },
      { label: 'Rewards', icon: SettingsIcon, href: '/caregiver/rewards', permission: 'caregiver.read' },
    ]
  },
  {
    title: 'SYSTEM & SUPPORT',
    items: [
      { label: 'Support Queue', icon: HelpCircleIcon, href: '/support', permission: 'support.read' },
      { label: 'FAQ Database', icon: MessageSquareIcon, href: '/support/faqs', permission: 'support.read' },
      { label: 'Infrastructure', icon: ServerIcon, href: '/tester', permission: 'tester.all' },
      { label: 'Billing & Usage', icon: SettingsIcon, href: '/provider/billing', permission: 'appointment.read' },
      { label: 'Settings', icon: SettingsIcon, href: '/settings' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed } = useLayout();

  const renderMenuItems = (items: MenuItem[]) => {
    return items
      .filter(item => {
        if (user?.roles.includes('tester')) return true;
        return !item.permission || user?.permissions.includes(item.permission);
      })
      .map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-1.5 text-[13px] font-medium transition-all duration-200 group relative",
              isActive 
                ? "bg-[#059669] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 transition-transform duration-200 shrink-0",
              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
            )} />
            {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
            )}
          </Link>
        );
      });
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#F8F9FA] border-r border-slate-200 flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[256px]"
      )}
    >
      <div className="p-4  bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-md bg-white shadow-sm border border-slate-200 p-1.5 transition-all",
            isCollapsed ? "w-10 h-10" : "w-12 h-12"
          )}>
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <span className="text-xl font-bold text-[#059669] tracking-tight block">GmNC</span>
              <span className="text-[8px] text-slate-500 font-extrabold tracking-widest uppercase block -mt-1">getmyneurocare</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {MENU_CATEGORIES.map((category) => {
          const visibleItems = category.items.filter(item => {
            if (user?.roles.includes('tester')) return true;
            return !item.permission || user?.permissions.includes(item.permission);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={category.title} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-[10px] font-bold text-[#059669]/60 tracking-[0.1em] uppercase mb-2">
                  {category.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {renderMenuItems(category.items)}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 bg-white border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 hover:bg-emerald-50 hover:text-[#059669] transition-all duration-200 group text-[13px] font-medium"
        >
          <LogOutIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
          {!isCollapsed && <span className="tracking-tight">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
