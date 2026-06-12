'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute>
      
    <div className="w-full pb-8 pt-4">
      <div className="w-full px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Security Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure security settings and access controls.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-1">
            <div className="flex justify-between items-center py-4 border-b border-gray-50 group">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Alerts & summary</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transform transition-transform group-hover:scale-105"></div>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-50 group">
              <div>
                <p className="text-sm font-semibold text-gray-900">Two-Factor Auth</p>
                <p className="text-xs text-gray-500 mt-0.5">Extra security layer</p>
              </div>
              <button className="text-xs text-blue-600 font-bold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Enable</button>
            </div>
            <div className="flex justify-between items-center py-4 group">
              <div>
                <p className="text-sm font-semibold text-gray-900">Password</p>
                <p className="text-xs text-gray-500 mt-0.5">Last changed 30d ago</p>
              </div>
              <Link href="/profile/change-password" className="text-xs text-gray-700 font-bold hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors inline-block text-center">Update</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>

)
}
