'use client';

import React from 'react';

export default function PermissionToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-emerald-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}