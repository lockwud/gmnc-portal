'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

const activityRows = [
  { action: 'Logged in to dashboard', area: 'Authentication', time: 'Just now', status: 'Completed' },
  { action: 'Updated profile settings', area: 'Profile', time: '2 days ago', status: 'Completed' },
  { action: 'Viewed patient records', area: 'Clinical workspace', time: '3 days ago', status: 'Completed' },
];

function initials(name?: string) {
  return (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, selectedRole } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="animate-pulse font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const roles = user.roles || [];
  const permissions = user.permissions || [];

  return (
    <div className="min-h-full bg-white px-6 py-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-lg font-black text-slate-800">
            {initials(user.name)}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">My Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account, access, security, and personal workflow settings.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/profile/edit" className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
            <span className="material-icons text-[18px]">edit</span>
            Edit profile
          </Link>
          <Link href="/profile/signature" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50">
            <span className="material-icons text-[18px]">draw</span>
            Signature
          </Link>
        </div>
      </header>

      <main className="space-y-6 pb-8">
        <section>
          <h2 className="mb-3 text-sm font-black text-slate-950">Account Details</h2>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="w-56 bg-slate-50 px-4 py-3 font-bold text-slate-600">Name</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{user.name || '—'}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-4 py-3 font-bold text-slate-600">Email</td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-4 py-3 font-bold text-slate-600">Active Role</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md px-2.5 py-1 text-xs font-black uppercase text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
                      {selectedRole || roles[0] || 'No role selected'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-4 py-3 font-bold text-slate-600">Assigned Roles</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {roles.length > 0 ? roles.map((role) => (
                        <span key={role} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-700">{role}</span>
                      )) : <span className="text-slate-400">No roles assigned</span>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">Role Permissions</h2>
            <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{permissions.length} assigned</span>
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Permission</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length > 0 ? permissions.map((permission) => (
                  <tr key={permission} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">{permission}</td>
                    <td className="px-4 py-3 text-slate-600">Platform</td>
                    <td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">Enabled</span></td>
                    <td className="px-4 py-3 text-slate-500">User has permission to execute this action across the system.</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No specific permissions assigned to this account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-black text-slate-950">Security & Preferences</h2>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-bold text-slate-800">Email Notifications</td>
                    <td className="px-4 py-3 text-slate-500">Alerts and summaries</td>
                    <td className="px-4 py-3 text-right"><Link href="/settings/notifications" className="text-xs font-bold text-slate-700 hover:text-slate-950">Manage</Link></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-slate-800">Two-Factor Auth</td>
                    <td className="px-4 py-3 text-slate-500">Extra security layer</td>
                    <td className="px-4 py-3 text-right"><span className="text-xs font-bold text-slate-400">Not enabled</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-slate-800">Password</td>
                    <td className="px-4 py-3 text-slate-500">Change your sign-in password</td>
                    <td className="px-4 py-3 text-right"><Link href="/profile/change-password" className="text-xs font-bold text-slate-700 hover:text-slate-950">Update</Link></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-black text-slate-950">Recent Activity</h2>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Activity</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Area</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityRows.map((activity) => (
                    <tr key={`${activity.action}-${activity.time}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-slate-900">{activity.action}</td>
                      <td className="px-4 py-3 text-slate-600">{activity.area}</td>
                      <td className="px-4 py-3 text-slate-500">{activity.time}</td>
                      <td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{activity.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
