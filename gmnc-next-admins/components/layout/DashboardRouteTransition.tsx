'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSkeletonType, SKELETON_COMPONENTS } from './skeletons';

function DashboardTransitionSkeleton({ pathname }: { pathname: string }) {
  const SkeletonComponent = SKELETON_COMPONENTS[getSkeletonType(pathname)];
  return <SkeletonComponent />;
}

export default function DashboardRouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
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
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">{children}</div>
      {showSkeleton ? (
        <div className="absolute inset-0 z-30 bg-slate-50 px-6 py-6">
          <DashboardTransitionSkeleton pathname={pathname} />
        </div>
      ) : null}
    </div>
  );
}
