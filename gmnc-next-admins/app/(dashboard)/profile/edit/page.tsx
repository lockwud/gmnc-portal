'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/profile');
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="h-full w-full overflow-y-auto pb-12 pr-2">
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <span className="material-icons text-[18px]">arrow_back</span>
          Back
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden relative group cursor-pointer shadow-sm">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              ) : (
                <span className="group-hover:opacity-20 transition-opacity text-gray-500">{user.name?.substring(0, 2).toUpperCase() || 'U'}</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons text-gray-700">photo_camera</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-500 mt-1 mb-3">Upload a new photo or remove the current one.</p>
              <div className="flex gap-3">
                <button type="button" className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">Upload</button>
                <button type="button" className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors">Remove</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 cursor-not-allowed text-gray-500 transition-shadow"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <span className="material-icons text-[14px]">info</span>
                Contact support to change your email address.
              </p>
            </div>
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
              {isSubmitting && <span className="material-icons animate-spin text-[18px]">refresh</span>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
