'use client';

import React, { useEffect, useRef } from 'react';
import { COLORS } from '@/lib/colors';

type Props = {
  open: boolean;
  onClose: () => void;
  width?: string; // Tailwind width class, e.g. 'w-64', 'w-72'
};

const NotificationsPanel: React.FC<Props> = ({ open, onClose, width = 'w-64' }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
	function onKey(e: KeyboardEvent) {
	  if (e.key === 'Escape') onClose();
	}
	if (open) {
	  window.addEventListener('keydown', onKey);
	  // focus the close button when opened
	  setTimeout(() => closeBtnRef.current?.focus(), 0);
	}
	return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const activeBg = (COLORS && (COLORS.activeBg ?? COLORS.primary)) || '#2563EB';

  return (
	<div
	  className="fixed inset-0 z-50 flex"
	  aria-modal="true"
	  role="dialog"
	  aria-labelledby="notifications-title"
	>
	  {/* Overlay with blur */}
	  <div
		className="absolute inset-0 bg-black/30 backdrop-blur-sm"
		onClick={onClose}
		aria-hidden
	  />

	  {/* Panel (right side) */}
	  <aside
		className={`${width} relative ml-auto h-full bg-white shadow-xl border-l flex flex-col`}
		style={{ borderLeftColor: '#e6e9f2' }}
		role="document"
	  >
		{/* Header */}
		<div className="px-4 py-3 flex items-start justify-between border-b" style={{ borderColor: '#e6e9f2' }}>
		  <div>
			<h2 id="notifications-title" className="text-sm font-semibold" style={{ color: '#111827' }}>
			  Notifications
			</h2>
			<p className="text-xs text-gray-500">All caught up!</p>
		  </div>

		  {/* Smaller circular close button (28x28) */}
		  <button
			ref={closeBtnRef}
			onClick={onClose}
			aria-label="Close notifications"
			title=""
			className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-100 text-gray-600 focus:outline-none"
			style={{ boxShadow: 'none' }}
		  >
			<span
			  className="material-icons text-xs"
			  style={{ color: '#374151' }}
			  aria-hidden
			>
			  close
			</span>

			{/* subtle focus ring using active color */}
			<style jsx>{`
			  button:focus {
				box-shadow: 0 0 0 3px ${activeBg}22; /* active color at ~13% opacity */
			  }
			`}</style>
		  </button>
		</div>

		{/* Content */}
		<div className="p-6 flex-1 overflow-auto">
		  <div className="flex flex-col items-center text-center">
			<span
			  className="material-icons mb-4"
			  style={{ fontSize: 44, color: '#9CA3AF' }}
			  aria-hidden
			>
			  notifications_none
			</span>

			<div className="text-sm font-semibold text-gray-700 mb-1">No notifications</div>
			<div className="text-xs text-gray-400 max-w-[220px]">
			  You're all caught up! New notifications will appear here.
			</div>
		  </div>
		</div>
	  </aside>
	</div>
  );
};

export default NotificationsPanel;