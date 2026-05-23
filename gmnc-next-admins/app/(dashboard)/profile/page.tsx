'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { COLORS } from '@/lib/colors';

export default function ProfilePage() {
  const { user, selectedRole } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-500 animate-pulse font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto pb-12 pr-2">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div 
            className="h-40 relative" 
            style={{ 
              background: `linear-gradient(135deg, ${COLORS?.primary || '#2563EB'}, ${COLORS?.activeBg || '#1D4ED8'})` 
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 left-8 md:left-12">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl font-bold text-gray-700 overflow-hidden shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-8 px-8 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="material-icons text-sm">email</span>
                {user.email}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedRole && (
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Active: {selectedRole}
                  </span>
                )}
                {user.roles?.filter(r => r !== selectedRole).map(r => (
                  <span key={r} className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-full border border-gray-200 uppercase tracking-wider shadow-sm">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          
            <div>
              <Link href="/profile/edit" className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                <span className="material-icons text-[18px]">edit</span>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <span className="material-icons">admin_panel_settings</span>
                </div>
                Role Permissions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.permissions?.map(perm => (
                  <div key={perm} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5">
                      <span className="material-icons text-green-500 text-base">check_circle</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 bg-white border border-gray-200 px-2.5 py-0.5 rounded shadow-sm inline-block mb-1">
                        {perm}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        User has explicit permission to execute this action across the platform.
                      </p>
                    </div>
                  </div>
                ))}
                {(!user.permissions || user.permissions.length === 0) && (
                  <div className="col-span-2 py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <span className="material-icons text-gray-300 text-4xl mb-2">lock_outline</span>
                    <p className="text-sm text-gray-500 font-medium">No specific permissions assigned to this account.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <span className="material-icons">history</span>
                </div>
                Recent Activity
              </h2>
              <div className="space-y-6">
                {[
                  { action: 'Logged in to dashboard', time: 'Just now', icon: 'login', color: 'text-green-600', bg: 'bg-green-50' },
                  { action: 'Updated profile settings', time: '2 days ago', icon: 'settings', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { action: 'Viewed patient records', time: '3 days ago', icon: 'visibility', color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}>
                        <span className={`material-icons text-sm ${item.color}`}>{item.icon}</span>
                      </div>
                      {idx < 2 && <div className="w-px h-full bg-gray-100 absolute top-10 mt-2 bottom-0 -mb-4"></div>}
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <span className="material-icons">security</span>
                </div>
                Security & Settings
              </h2>
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

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-3xl shadow-md text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-icons text-8xl">verified_user</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                  <span className="material-icons text-blue-400">support_agent</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Need Support?</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  Our support team is available 24/7 to assist you with any questions or issues you might have.
                </p>
                <button className="w-full py-2.5 bg-white text-gray-900 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}