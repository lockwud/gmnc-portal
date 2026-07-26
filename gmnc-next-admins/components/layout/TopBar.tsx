'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { getUnreadNotificationCount } from '@/lib/api/notifications';

type Props = {
  onToggleSidebar: () => void;
};

const ToggleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3.25" y="4" width="11.5" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.25 4.25V13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }
  return null;
}

const TopBar: React.FC<Props> = ({ onToggleSidebar }) => {
  const { user, logout, selectedRole, token, isLoading } = useAuth();
  const { isDark, setThemeMode, preferences } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loaded = useRef(false);
  const notificationAuthFailedRef = useRef(false);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    loaded.current = true;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
    };
  }, []);

  useEffect(() => {
    notificationAuthFailedRef.current = false;
    if (isLoading || !token || !user?.id) {
      const timeout = window.setTimeout(() => setUnreadCount(0), 0);
      return () => window.clearTimeout(timeout);
    }
    let cancelled = false;
    async function loadUnreadCount() {
      if (cancelled || notificationAuthFailedRef.current) return;
      try {
        const count = await getUnreadNotificationCount(token);
        if (!cancelled && loaded.current) {
          setUnreadCount(typeof count === 'number' ? count : 0);
        }
      } catch (error) {
        const status = getErrorStatus(error);
        if (status === 401 || status === 403) {
          notificationAuthFailedRef.current = true;
          clearInterval(interval);
        }
        if (!cancelled && loaded.current) {
          setUnreadCount(0);
        }
      }
    }
    const timeout = window.setTimeout(() => { void loadUnreadCount(); }, 0);
    const interval = setInterval(() => { void loadUnreadCount(); }, 30000);
    return () => { cancelled = true; window.clearTimeout(timeout); clearInterval(interval); };
  }, [isLoading, token, user?.id]);

  useEffect(() => {
    function handleUnreadChanged(event: Event) {
      const detail = (event as CustomEvent<{ unreadCount?: number }>).detail;
      if (typeof detail?.unreadCount === 'number') {
        setUnreadCount(detail.unreadCount);
      }
    }
    window.addEventListener('notifications:unread-changed', handleUnreadChanged);
    return () => { window.removeEventListener('notifications:unread-changed', handleUnreadChanged); };
  }, []);

  const cycleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = modes.indexOf(preferences.themeMode);
    setThemeMode(modes[(idx + 1) % modes.length]);
  };

  const themeIcon = isDark ? 'dark_mode' : preferences.themeMode === 'system' ? 'brightness_6' : 'light_mode';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search for', query);
  };

  return (
    <>
      <div
        className="h-14 flex items-center px-4 md:px-6 justify-between shadow-sm"
        style={{
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--topbar-border)',
          color: 'var(--topbar-text)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
          >
            <ToggleIcon />
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
                className="flex items-center gap-2 rounded-xl px-2 py-1 transition-all duration-200 shadow-sm cursor-text"
                style={{
                  width: searchOpen ? '300px' : '40px',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <span className="material-icons text-xs" style={{ color: 'var(--card-muted)' }}>search</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search portal"
                  className="bg-transparent outline-none text-sm transition-all duration-200"
                  style={{
                    opacity: searchOpen ? 1 : 0,
                    width: searchOpen ? '100%' : 0,
                    color: 'var(--input-text)',
                  }}
                  aria-label="Search"
                />
              </div>
            </form>
          </div>

          <button
            onClick={cycleTheme}
            className="p-1 rounded hover:opacity-80 transition-colors"
            title={`Theme: ${preferences.themeMode}`}
            type="button"
            style={{ color: 'var(--topbar-text)' }}
          >
            <span className="material-icons text-xs">{themeIcon}</span>
          </button>

          <button
            onClick={() => {
              setNotifOpen((s) => !s);
              setUserOpen(false);
              setSearchOpen(false);
            }}
            className="relative p-1 rounded hover:opacity-80 transition-colors"
            title="Notifications"
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            type="button"
            style={{ color: 'var(--topbar-text)' }}
          >
            <span className="material-icons text-xs">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setUserOpen((s) => !s);
                setSearchOpen(false);
                setNotifOpen(false);
              }}
              className="w-8 h-8 text-sm flex items-center justify-center rounded-full"
              title="Account"
              aria-haspopup="true"
              type="button"
              style={{
                color: 'var(--sidebar-active-bg)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                fontWeight: 600,
              }}
            >
              <span className="text-sm">{user?.name ? user.name.substring(0, 2).toUpperCase() : ''}</span>
            </button>

            {userOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-40"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div className="p-3 overflow-hidden">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--card-text)' }} title={user?.name}>{user?.name || 'Account'}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--card-muted)' }}>{selectedRole || 'User'}</p>
                  <p className="text-xs mt-1 truncate" style={{ color: 'var(--card-muted)' }} title={user?.email}>{user?.email || ''}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--card-border)' }}>
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={cycleTheme}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80"
                    type="button"
                    style={{ color: 'var(--card-text)' }}
                  >
                    <span className="material-icons text-sm" style={{ color: 'var(--card-muted)' }}>{themeIcon}</span>
                    <span>Theme: {preferences.themeMode === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}</span>
                  </button>

                  <Link href="/settings/appearance" onClick={() => setUserOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--card-text)' }}>
                    <span className="material-icons text-sm" style={{ color: 'var(--card-muted)' }}>palette</span>
                    <span>Appearance</span>
                  </Link>

                  <Link href="/profile" onClick={() => setUserOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--card-text)' }}>
                    <span className="material-icons text-sm" style={{ color: 'var(--card-muted)' }}>account_circle</span>
                    <span>Profile</span>
                  </Link>

                  <Link href="/profile/change-password" onClick={() => setUserOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--card-text)' }}>
                    <span className="material-icons text-sm" style={{ color: 'var(--card-muted)' }}>vpn_key</span>
                    <span>Change Password</span>
                  </Link>

                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80" type="button" style={{ color: 'var(--card-text)' }}>
                    <span className="material-icons text-sm" style={{ color: 'var(--card-muted)' }}>logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};

export default TopBar;
