'use client';

import React from 'react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
};

export default function EmptyState({ title = 'OOOPS!', description = 'No data to show.', icon, className }: EmptyStateProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center p-6 ${className ?? ''}`}>
      <div className="w-28 h-28 flex items-center justify-center mb-4">
        {icon ?? (
          <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
            <rect x="4" y="18" width="58" height="36" rx="3" stroke="#CBD5E1" strokeWidth="2" fill="none"/>
            <path d="M22 18L28 10h18l6 8" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="66" cy="30" r="12" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M72 36l8 8" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <path d="M64 28l4-4M68 28l-4-4" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-2 max-w-xs">{description}</p>}
    </div>
  );
}