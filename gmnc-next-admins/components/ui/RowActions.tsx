'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  ariaLabel?: string;
  hideEdit?: boolean;
  hideDelete?: boolean;
};

export default function RowActions({
  onEdit,
  onDelete,
  ariaLabel = 'Row actions',
  hideEdit = false,
  hideDelete = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="5" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="19" r="1.7" fill="currentColor" />
        </svg>
      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-22 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {!hideEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className="flex h-8 w-full items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Edit"
              title="Edit"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 21l3.75-.75L18.5 8.5l-3-3L3.75 17.25 3 21z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5 6.5l3 3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {!hideDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
              className="flex h-8 w-full items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Delete"
              title="Delete"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 7l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 11v5M14 11v5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}