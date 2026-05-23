'use client';

export default function TelehealthRoomsSkeleton() {
  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-64 rounded-full skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-40 rounded-full skeleton-shimmer" />
          <div className="h-10 w-32 rounded-full skeleton-shimmer" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 w-40 rounded-full skeleton-shimmer" />
              <div className="h-5 w-20 rounded-full skeleton-shimmer" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded-full skeleton-shimmer" />
              <div className="h-3 w-5/6 rounded-full skeleton-shimmer" />
              <div className="h-3 w-4/6 rounded-full skeleton-shimmer" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-4 w-32 rounded-full skeleton-shimmer" />
              <div className="h-4 w-32 rounded-full skeleton-shimmer" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="h-8 w-24 rounded-full skeleton-shimmer" />
              <div className="h-8 w-24 rounded-full skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}