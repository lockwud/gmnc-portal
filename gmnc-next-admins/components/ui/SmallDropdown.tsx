'use client';

import React, { useEffect, useState, useRef } from 'react';

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function SmallDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  open,
  onOpenChange,
  pageSize = 4,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  placeholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSize?: number;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onOpenChange, open]);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOptions = filteredOptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div ref={rootRef} className="relative w-full max-w-[260px]">
      <button
        type="button"
        aria-label={placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          if (nextOpen) {
            setSearch('');
            setPage(1);
          }
          onOpenChange(nextOpen);
        }}
        className="flex h-8 w-full items-center justify-between rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition hover:border-slate-300"
      >
        <span className={selected ? 'truncate' : 'truncate text-slate-400'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="mb-1.5 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedOptions.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-slate-500">No results found.</div>
            ) : (
              paginatedOptions.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      onOpenChange(false);
                    }}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between px-2 py-1">
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-[11px] text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <span className="text-[11px] text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-[11px] text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
