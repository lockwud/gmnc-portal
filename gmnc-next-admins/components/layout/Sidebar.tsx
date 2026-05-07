'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useLayout } from '@/lib/context/LayoutContext';
import { Permission } from '@/lib/rbac';
import {
  ActivityIcon,
  BarChart3Icon,
  CalendarIcon,
  ChevronRightIcon,
  CreditCardIcon,
  Gamepad2Icon,
  GiftIcon,
  HelpCircleIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  ServerIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  permission?: Permission;
  children?: SidebarItem[];
}

interface MenuCategory {
  title: string;
  items: SidebarItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Overview', icon: LayoutDashboardIcon, href: '/dashboard' },
      { label: 'Admin Dashboard', icon: ShieldAlertIcon, href: '/admin', permission: 'system.manage' },
      { label: 'Provider Dashboard', icon: StethoscopeIcon, href: '/provider', permission: 'appointment.read' },
      { label: 'Caregiver Dashboard', icon: UserIcon, href: '/caregiver', permission: 'caregiver.read' },
      { label: 'Support Dashboard', icon: HelpCircleIcon, href: '/support', permission: 'support.read' },
      { label: 'Infrastructure Dashboard', icon: ServerIcon, href: '/tester', permission: 'tester.all' },
    ],
  },
  {
    title: 'WORKSPACES',
    items: [
      {
        label: 'Admin',
        icon: ShieldAlertIcon,
        permission: 'system.manage',
        children: [
          { label: 'Analytics', icon: BarChart3Icon, href: '/admin/analytics', permission: 'system.manage' },
          { label: 'Inbox', icon: InboxIcon, href: '/admin/inbox', permission: 'system.manage' },
          { label: 'Users', icon: UsersIcon, href: '/admin/users', permission: 'system.manage' },
          { label: 'Roles & Access', icon: ShieldCheckIcon, href: '/admin/roles', permission: 'system.manage' },
          { label: 'Audit Viewer', icon: ActivityIcon, href: '/admin/audit', permission: 'system.manage' },
          { label: 'Referral Campaigns', icon: UsersIcon, href: '/admin/referrals', permission: 'system.manage' },
          { label: 'Integrations', icon: ServerIcon, href: '/admin/integrations', permission: 'system.manage' },
          { label: 'Provider Network', icon: StethoscopeIcon, href: '/admin/providers', permission: 'system.manage' },
        ],
      },
      {
        label: 'Provider',
        icon: StethoscopeIcon,
        permission: 'appointment.read',
        children: [
          { label: 'Appointments', icon: CalendarIcon, href: '/provider/appointments', permission: 'appointment.read' },
          { label: 'Patient List', icon: UsersIcon, href: '/provider/clients', permission: 'appointment.read' },
          { label: 'Referral Track', icon: MessageSquareIcon, href: '/provider/referrals', permission: 'appointment.read' },
          { label: 'Tasks & Notes', icon: ActivityIcon, href: '/provider/tasks', permission: 'appointment.read' },
          { label: 'Billing & Usage', icon: CreditCardIcon, href: '/provider/billing', permission: 'appointment.read' },
        ],
      },
      {
        label: 'Caregiver',
        icon: UserIcon,
        permission: 'caregiver.read',
        children: [
          { label: 'Telehealth', icon: MessageSquareIcon, href: '/caregiver/telehealth', permission: 'caregiver.read' },
          { label: 'Games & Well-being', icon: Gamepad2Icon, href: '/caregiver/games', permission: 'caregiver.read' },
          { label: 'Rewards', icon: GiftIcon, href: '/caregiver/rewards', permission: 'caregiver.read' },
        ],
      },
      {
        label: 'Support',
        icon: HelpCircleIcon,
        permission: 'support.read',
        children: [
          { label: 'FAQ Database', icon: MessageSquareIcon, href: '/support/faqs', permission: 'support.read' },
        ],
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', icon: SettingsIcon, href: '/settings' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed } = useLayout();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const hasAccess = React.useCallback(
    (item: SidebarItem) => {
      if (user?.roles.includes('tester')) return true;
      return !item.permission || user?.permissions.includes(item.permission);
    },
    [user]
  );

  const isHrefActive = React.useCallback(
    (href?: string) => {
      if (!href) return false;
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  const getVisibleChildren = React.useCallback(
    (item: SidebarItem) => (item.children || []).filter(hasAccess),
    [hasAccess]
  );

  const isGroupActive = React.useCallback(
    (item: SidebarItem) => getVisibleChildren(item).some((child) => isHrefActive(child.href)),
    [getVisibleChildren, isHrefActive]
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  const renderLinkItem = (item: SidebarItem, nested = false) => {
    if (!item.href) return null;

    const isActive = isHrefActive(item.href);

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 text-[13px] font-medium transition-all duration-200',
          nested ? 'ml-6 rounded-xl px-3 py-2' : 'px-4 py-1.5',
          isActive ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
          )}
        />
        {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />}
      </Link>
    );
  };

  const renderMenuItems = (items: SidebarItem[]) => {
    return items
      .filter(hasAccess)
      .map((item) => {
        const visibleChildren = getVisibleChildren(item);

        if (!item.children || visibleChildren.length === 0) {
          return renderLinkItem(item);
        }

        const isActive = isGroupActive(item);
        const isOpen = openGroups[item.label] ?? isActive;

        return (
          <div key={item.label}>
            <button
              type="button"
              onClick={() => toggleGroup(item.label)}
              className={cn(
                'group relative flex w-full items-center gap-3 px-4 py-2 text-[13px] font-medium transition-all duration-200',
                isActive ? 'bg-emerald-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#059669]' : 'text-slate-400 group-hover:text-slate-600')} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left tracking-tight">{item.label}</span>
                  <ChevronRightIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90', isActive ? 'text-[#059669]' : 'text-slate-400')} />
                </>
              )}
            </button>

            {!isCollapsed && isOpen && (
              <div className="mt-1 space-y-1 border-l border-slate-200/80 pl-2">
                {visibleChildren.map((child) => renderLinkItem(child, true))}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-[#F8F9FA] transition-all duration-300',
        isCollapsed ? 'w-[80px]' : 'w-[256px]'
      )}
    >
      <div className="border-b border-slate-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-md border border-slate-200 bg-white p-1.5 shadow-sm transition-all',
              isCollapsed ? 'h-10 w-10' : 'h-12 w-12'
            )}
          >
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <span className="block text-xl font-bold tracking-tight text-[#059669]">GmNC</span>
              <span className="-mt-1 block text-[8px] font-extrabold uppercase tracking-widest text-slate-500">getmyneurocare</span>
            </div>
          )}
        </div>
      </div>

      <nav className="scrollbar-hide flex-1 space-y-6 overflow-y-auto py-4">
        {MENU_CATEGORIES.map((category) => {
          const visibleItems = category.items.filter((item) => {
            if (item.children) {
              return getVisibleChildren(item).length > 0;
            }

            return hasAccess(item);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={category.title} className="space-y-1">
              {!isCollapsed && (
                <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#059669]/60">
                  {category.title}
                </h3>
              )}
              <div className="space-y-0.5">{renderMenuItems(category.items)}</div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 bg-white p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-emerald-50 hover:text-[#059669]"
        >
          <LogOutIcon className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span className="tracking-tight">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
