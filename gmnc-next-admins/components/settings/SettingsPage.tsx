'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Bell,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileQuestion,
  Gamepad2,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  MessageSquareWarning,
  Palette,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';

type SettingItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type SettingSection = {
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
};

const sections: SettingSection[] = [
  {
    title: 'General Settings',
    icon: Settings,
    items: [
      { label: 'Configurations', href: '/settings/platform', icon: Settings },
      { label: 'Code Settings', href: '/settings/assessment', icon: ClipboardCheck },
      { label: 'Workflow Questions', href: '/settings/assessment', icon: FileQuestion },
      { label: 'Templates', href: '/settings/clinical-notes', icon: ClipboardList },
      { label: 'Appearance', href: '/settings/appearance', icon: Palette },
      { label: 'Alert & Notifications', href: '/settings/notifications', icon: Bell },
    ],
  },
  {
    title: 'User Account Management',
    icon: UserCog,
    items: [
      { label: 'My Profile Settings', href: '/profile', icon: UsersRound },
      { label: 'User Management', href: '/admin/users', icon: UserCog },
      { label: 'Roles & Access', href: '/admin/roles-access', icon: ShieldCheck },
      { label: 'Role Assignments', href: '/admin/role-assignments', icon: UserCog },
      { label: 'Security', href: '/settings/security', icon: LockKeyhole },
    ],
  },
  {
    title: 'Clinical Workflow Management',
    icon: Stethoscope,
    items: [
      { label: 'Assessment Tools', href: '/settings/assessment', icon: ClipboardCheck },
      { label: 'Referral Workflow', href: '/settings/referrals', icon: ArrowLeftRight },
      { label: 'Clinical Notes & Tasks', href: '/settings/clinical-notes', icon: ClipboardList },
      { label: 'Care Plans', href: '/provider/care-plans', icon: ClipboardList },
      { label: 'Provider Reports', href: '/admin/reports', icon: Database },
    ],
  },
  {
    title: 'Scheduling & Provider Operations',
    icon: CalendarClock,
    items: [
      { label: 'Appointment Configuration', href: '/settings/appointments', icon: CalendarClock },
      { label: 'Provider Appointment Rules', href: '/settings/provider-appointments', icon: Stethoscope },
      { label: 'Working Hours', href: '/settings/working-hours', icon: CalendarClock },
      { label: 'Telehealth', href: '/settings/telehealth', icon: Video },
      { label: 'Workspace Preferences', href: '/settings/workspace', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Mobile Experience Management',
    icon: Gamepad2,
    items: [
      { label: 'Games & Wellbeing', href: '/settings/games', icon: Gamepad2 },
      { label: 'Caregiver Notifications', href: '/settings/notifications', icon: Bell },
      { label: 'Assessment Instructions', href: '/settings/assessment', icon: ClipboardCheck },
      { label: 'FAQ Management', href: '/settings/faqs', icon: FileQuestion },
      { label: 'Support Workflow', href: '/settings/support', icon: LifeBuoy },
    ],
  },
  {
    title: 'Governance & Data Policies',
    icon: ShieldCheck,
    items: [
      { label: 'Data Retention Policies', href: '/settings/data-retention', icon: Database },
      { label: 'Issue Categories & Escalations', href: '/settings/escalations', icon: MessageSquareWarning },
      { label: 'Support Rules', href: '/settings/support', icon: Headphones },
      { label: 'Platform Workspace', href: '/settings/workspace', icon: LayoutDashboard },
    ],
  },
];

export default function SystemSettings() {
  return (
    <div className="min-h-full bg-white px-6 py-6">
      <header className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">System Settings</h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-500">
          Configure the admin portal, provider workflows, and mobile experiences for providers and caregivers.
        </p>
      </header>

      <main className="space-y-8 pb-10">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section key={section.title}>
              <div className="mb-3 flex items-center gap-3">
                <SectionIcon className="h-4 w-4 text-slate-500" />
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={`${section.title}-${item.label}`} href={item.href} className="group">
                      <div className="flex h-12 items-center gap-4 rounded-md border border-slate-200 bg-white px-4 shadow-sm transition hover:border-slate-300 hover:bg-white hover:shadow-md">
                        <ItemIcon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-sm font-bold text-slate-950">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
