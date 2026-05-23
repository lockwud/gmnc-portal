'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import { COLORS } from '@/lib/colors';
import { useAuth } from '@/lib/context/AuthContext';

type Props = {
  onToggleSidebar: () => void;
};

const ToggleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 12L7 10L9 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" opacity="0.05" />
  </svg>
);

const TopBar: React.FC<Props> = ({ onToggleSidebar }) => {
  const { user, logout, selectedRole } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setUserOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search for', query);
  };

  return (
    <>
      <div className="h-14 bg-white flex items-center px-4 md:px-6 justify-between shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="p-1 rounded hover:bg-gray-100"
            type="button"
          >
            <ToggleIcon className="text-gray-700" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2" ref={containerRef}>
          <div className="relative">
            <form onSubmit={onSubmit} className="flex items-center">
              <div
                onClick={() => {
                  setSearchOpen((s) => !s);
                  setUserOpen(false);
                  setNotifOpen(false);
                }}
                className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-2 py-1 transition-all duration-200 shadow-sm cursor-text ${searchOpen ? 'w-52' : 'w-10'}`}
              >
                <span className="material-icons text-gray-600 text-xs">search</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search portal"
                  className={`bg-transparent outline-none text-sm transition-all duration-200 ${searchOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}
                  aria-label="Search"
                />
              </div>
            </form>
          </div>

          <button className="p-1 rounded hover:bg-gray-100" title="Toggle theme" type="button">
            <span className="material-icons text-xs">brightness_6</span>
          </button>

          <button
            onClick={() => {
              setNotifOpen(true);
              setUserOpen(false);
              setSearchOpen(false);
            }}
            className="p-1 rounded hover:bg-gray-100"
            title="Notifications"
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            type="button"
          >
            <span className="material-icons text-xs">notifications</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setUserOpen((s) => !s);
                setSearchOpen(false);
                setNotifOpen(false);
              }}
              className="w-8 h-8 bg-white text-sm flex items-center justify-center rounded-full border"
              title="Account"
              aria-haspopup="true"
              type="button"
              style={{ color: activeBg, borderColor: '#e6e9f2', fontWeight: 600 }}
            >
              <span className="text-sm">{user?.name ? user.name.substring(0, 2).toUpperCase() : ''}</span>
            </button>

            {userOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-40 border">
                <div className="p-3 overflow-hidden">
                  <p className="font-semibold text-sm truncate" title={user?.name}>{user?.name || 'Account'}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedRole || 'User'}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={user?.email}>{user?.email || ''}</p>
                </div>

                <div className="border-t">
                  <Link href="/profile" onClick={() => setUserOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm">
                    <span className="material-icons text-sm text-gray-600">account_circle</span>
                    <span>Profile</span>
                  </Link>

                  <Link href="/profile/change-password" onClick={() => setUserOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm">
                    <span className="material-icons text-sm text-gray-600">vpn_key</span>
                    <span>Change Password</span>
                  </Link>

                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" type="button">
                    <span className="material-icons text-sm text-gray-600">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} width="w-64" />
    </>
  );
};

export default TopBar;