"use client";

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { MessageSquareIcon, PlusIcon, SearchIcon, FilterIcon, MoreVerticalIcon, GlobeIcon, EyeIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';

const MOCK_FAQS = [
  { id: 'FAQ-001', question: 'How to add a new provider?', category: 'Onboarding', status: 'Published' },
  { id: 'FAQ-002', question: 'Telehealth setup for Safari', category: 'Technical', status: 'Published' },
  { id: 'FAQ-003', question: 'Updating billing information', category: 'Billing', status: 'Draft' },
  { id: 'FAQ-004', question: 'Session usage limits guide', category: 'Plans', status: 'Published' },
];

export default function FAQManagementPage() {
  return (
    <ProtectedRoute requiredPermission="support.read">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FAQ Management</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Create, categorize, and publish help articles for users.</p>
          </div>
          <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
            <PlusIcon size={18} /> New Article
          </Button>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                placeholder="Search articles..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium"
              />
           </div>
        </div>

        <Table 
          title="Help Articles"
          data={MOCK_FAQS}
          columns={[
            { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-accent' },
            { header: 'Question', accessor: 'question', className: 'font-bold text-slate-900' },
            { header: 'Category', accessor: 'category', className: 'text-xs text-slate-500 font-medium' },
            { header: 'Status', accessor: (item) => (
              <Badge variant={item.status === 'Published' ? 'success' : 'secondary'} className="text-[9px] uppercase font-bold">
                 {item.status}
              </Badge>
            )},
          ]}
          actions={() => (
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-300 hover:text-primary transition-all">
                  <EyeIcon size={18} />
               </button>
               <button className="p-2 text-slate-300 hover:text-primary transition-all">
                  <MoreVerticalIcon size={18} />
               </button>
            </div>
          )}
        />
      </div>
    </ProtectedRoute>
  );
}
