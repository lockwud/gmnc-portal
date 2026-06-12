'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function WorkspaceSettingsPage() {
  return (
    <ProtectedRoute>
      
    <div className="w-full pb-8 pt-4">
      <div className="w-full px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Workspace Preferences</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure workspace preferences.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">Workspace preferences configuration coming soon.</p>
        </div>
      </div>
    </div>
    </ProtectedRoute>

)
}
