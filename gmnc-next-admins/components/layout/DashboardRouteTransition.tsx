'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function DashboardTransitionSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 bg-slate-50/95 px-1 py-1">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded-xl skeleton-shimmer" />
          <div className="h-3 w-72 rounded-full skeleton-shimmer" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 w-24 rounded-full skeleton-shimmer" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-24 rounded-full skeleton-shimmer" />
            <div className="mt-4 h-8 w-16 rounded-xl skeleton-shimmer" />
            <div className="mt-4 h-3 w-28 rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-28 rounded-full skeleton-shimmer" />
          <div className="mt-2 h-3 w-40 rounded-full skeleton-shimmer" />
          <div className="mt-5 h-64 rounded-2xl skeleton-shimmer" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-40 rounded-full skeleton-shimmer" />
          <div className="mt-2 h-3 w-56 rounded-full skeleton-shimmer" />
          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardRouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const firstPaintRef = useRef(true);

  useEffect(() => {
    let isActive = true;
    setShowSkeleton(true);

    const timeout = window.setTimeout(() => {
      if (isActive) {
        setShowSkeleton(false);
      }
    }, firstPaintRef.current ? 1200 : 900);

    firstPaintRef.current = false;

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
      {showSkeleton ? (
        <div className="absolute inset-0 z-30 bg-slate-50 px-6 py-6">
          <DashboardTransitionSkeleton />
        </div>
      ) : null}
    </div>
  );
}
