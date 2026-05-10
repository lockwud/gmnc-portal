'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/profile');
    }, 1000);
  };

  return (
    <div className="h-full w-full overflow-y-auto pb-12 pr-2">
      <div className="max-w-xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <span className="material-icons text-[18px]">arrow_back</span>
          Back
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-100">
              <span className="material-icons text-[18px]">error_outline</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              required
            />
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li className="flex items-center gap-1">
                <span className={`material-icons text-[14px] ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-300'}`}>check_circle</span>
                At least 8 characters
              </li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/profile" className="px-6 py-2.5 text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-icons animate-spin text-[18px]">refresh</span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
