'use client';

import React, { useState, useRef, useEffect } from 'react';

type Option = { label: string; value: string };

type SelectDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
};

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select',
  className = '',
  icon,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className={`relative inline-block w-auto ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 min-w-[110px] max-w-[200px] items-center justify-between gap-1 rounded-full border border-slate-200 bg-white px-3 text-left text-[11px] text-slate-700 transition hover:border-slate-300"
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate flex-1">{selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 text-slate-400">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[180px] rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full rounded-xl px-3 py-1.5 text-left text-[11px] transition ${!value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {placeholder}
            </button>
            {options.map((option) => {
              const active = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setOpen(false); }}
                  className={`w-full rounded-xl px-3 py-1.5 text-left text-[11px] transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}