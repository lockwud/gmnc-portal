'use client';

import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/colors';

type DashboardItem = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  description?: string;
};

const sections: { items: DashboardItem[] }[] = [
  {
    items: [
      {
        id: 'admin',
        label: 'Admin',
        path: '/admin',
        icon: 'admin_panel_settings',
        description: 'Platform operations and approvals',
      },
      {
        id: 'provider',
        label: 'Provider',
        path: '/provider',
        icon: 'medical_services',
        description: 'Appointments, assessments and referrals',
      },
      {
        id: 'support',
        label: 'Support',
        path: '/support',
        icon: 'support_agent',
        description: 'Tickets, FAQ and user assistance',
      },
    ],
  },
];

const DashboardPage: React.FC = () => {
  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';

  return (
    <div className="px-6 pt-4 pb-6">
      <div className="w-full max-w-6xl">
        <h1 className="mb-1 text-2xl font-semibold" style={{ color: '#2c3e50' }}>
          <span className="mr-2">Welcome</span>
          <span style={{ color: activeBg }}>Marian Augben Nyarkou AbeiKu</span>
        </h1>

        <p className="mb-5 text-sm text-gray-600">
          Choose a dashboard to view detailed analytics and KPIs.
        </p>

        {sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {section.items.map((d) => (
                <Link
                  key={d.id}
                  href={d.path}
                  className="block min-h-[140px] rounded-xl border bg-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: '#e6e9f2' }}
                >
                  <div className="flex items-start gap-4 p-5">
                    <span
                      className="material-icons text-3xl"
                      style={{ color: activeBg }}
                      aria-hidden
                    >
                      {d.icon ?? 'dashboard'}
                    </span>

                    <div className="flex-1">
                      <h3 className="text-base font-semibold" style={{ color: '#111827' }}>
                        {d.label}
                      </h3>

                      {d.description && (
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {d.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 text-sm text-gray-400">View details</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
