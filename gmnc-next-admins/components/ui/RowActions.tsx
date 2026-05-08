'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * RowActions
 * - Renders a 3-dot button that opens a portal menu (Edit / Delete)
 * - Menu items are icon-only; a text label fades in on hover (group-hover)
 * - Stops propagation so clicks don't bubble to row/sidebar
 */

export default function RowActions({
  onEdit,
  onDelete,
  ariaLabel = 'Row actions',
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  ariaLabel?: string;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!btnRef.current) {
      setOpen((v) => !v);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + window.scrollY + 8,
      left: Math.max(8, r.right + window.scrollX - 160), // keep on screen
    });
    setOpen((v) => !v);
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && menuRef.current) {
      const b = menuRef.current.querySelector('button');
      (b as HTMLElement | null)?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        onMouseDown={(e) => e.stopPropagation()}
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
        className="p-1 rounded hover:bg-gray-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="5" r="1.6" fill="#6B7280" />
          <circle cx="12" cy="12" r="1.6" fill="#6B7280" />
          <circle cx="12" cy="19" r="1.6" fill="#6B7280" />
        </svg>
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white border rounded-md shadow-md w-40">
            {/* Edit - icon only, label visible on hover */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit?.(); }}
              className="group w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
              role="menuitem"
              title="Edit"
            >
              {/* pencil icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-gray-700">
                <path d="M3 21l3-1 11-11 1-3-3 1L4 20z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition">Edit</span>
            </button>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete?.(); }}
              className="group w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
              role="menuitem"
              title="Delete"
            >
              {/* trash icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-red-600">
                <path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition">Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
