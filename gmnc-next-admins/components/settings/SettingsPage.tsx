'use client';

import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/colors';

type SettingItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
};

type Section = {
  id: string;
  title: string;
  items: SettingItem[];
};

const sections: Section[] = [
  {
    id: 'platform',
    title: 'Configuration',
    items: [
      {
        id: 'general-platform',
        label: 'General Platform Settings',
        href: '/settings/platform',
        icon: 'settings',
      },
      {
        id: 'workspace',
        label: 'Workspace Preferences',
        href: '/settings/workspace',
        icon: 'dashboard_customize',
      },
      {
        id: 'appearance',
        label: 'Appearance',
        href: '/settings/appearance',
        icon: 'palette',
      },
    ],
  },
  {
    id: 'users-access',
    title: 'Users',
    items: [
      {
        id: 'user-management',
        label: 'Profiles',
        href: '/profile',
        icon: 'groups',
      },
      {
        id: 'security',
        label: 'Security',
        href: '/settings/security',
        icon: 'lock',
      },
    ],
  },
  {
    id: 'clinical-provider',
    title: 'Clinical & Provider Settings',
    items: [
      {
        id: 'appointments',
        label: 'Appointment Configuration',
        href: '/settings/appointments',
        icon: 'event',
      },
      {
        id: 'referrals',
        label: 'Referral Workflow Settings',
        href: '/settings/referrals',
        icon: 'compare_arrows',
      },
      {
        id: 'clinical-notes',
        label: 'Clinical Notes & Tasks',
        href: '/settings/clinical-notes',
        icon: 'assignment',
      },
    ],
  },
  {
    id: 'support-kb',
    title: 'Support & Knowledge Base',
    items: [
      {
        id: 'faq',
        label: 'FAQ Management',
        href: '/settings/faqs',
        icon: 'help_center',
      },
      {
        id: 'support-workflows',
        label: 'Support Workflow Rules',
        href: '/settings/support',
        icon: 'support_agent',
      },
      {
        id: 'issue-categories',
        label: 'Issue Categories & Escalations',
        href: '/settings/escalations',
        icon: 'report_problem',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security, Audit & Compliance',
    items: [
      {
        id: 'audit',
        label: 'Audit Log Settings',
        href: '/settings/audit',
        icon: 'history',
      },
      {
        id: 'compliance',
        label: 'Compliance & Consent',
        href: '/settings/compliance',
        icon: 'verified_user',
      },
      {
        id: 'data-retention',
        label: 'Data Retention Policies',
        href: '/settings/data-retention',
        icon: 'storage',
      },
    ],
  },
];

const sectionIcons: Record<string, string> = {
  platform: 'tune',
  'users-access': 'admin_panel_settings',
  'clinical-provider': 'medical_services',
  'support-kb': 'support_agent',
  security: 'shield',
};

const SystemSettings: React.FC = () => {
  const sectionIconColor = 'var(--sidebar-active-bg)';
  const itemIconColor = 'var(--card-text)';

  return (
    <div className="w-full pb-8 pt-4">
      <div className="w-full px-6">
        <header className="mb-5">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--card-text)' }}>
            System Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--card-muted)' }}>
            Configure core platform modules, operational rules, access policies, and communication preferences.
          </p>
        </header>

        <main className="space-y-8 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-none">
          {sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`section-${section.id}`}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-icons text-base"
                  style={{ color: sectionIconColor }}
                  aria-hidden
                >
                  {sectionIcons[section.id] ?? 'settings'}
                </span>
                <h2
                  id={`section-${section.id}`}
                  className="text-sm font-semibold"
                  style={{ color: 'var(--card-muted)' }}
                >
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {section.items.map((item) => (
                  <Link
                    href={item.href}
                    key={item.id}
                    className="block"
                    aria-label={item.label}
                  >
                    <div
                      className="flex items-center gap-3 rounded-full px-6 py-3 transition-shadow transition-colors hover:shadow-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--card-text)',
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--input-bg)' }} aria-hidden>
                        <span
                          className="material-icons"
                          style={{ color: itemIconColor, fontSize: 16 }}
                        >
                          {item.icon ?? 'tune'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--card-text)' }}>
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
