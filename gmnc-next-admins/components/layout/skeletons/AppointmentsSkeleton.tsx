'use client';

export default function AppointmentsSkeleton() {
  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-64 rounded-full skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-[120px] rounded-full skeleton-shimmer" />
          <div className="h-10 w-40 rounded-full skeleton-shimmer" />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-[280px] shrink-0 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full skeleton-shimmer" />
                <div className="h-4 w-32 rounded-full skeleton-shimmer" />
              </div>
              <div className="h-5 w-8 rounded-full skeleton-shimmer" />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="h-3 w-40 rounded-full skeleton-shimmer" />
                      <div className="mt-1 h-3 w-28 rounded-full skeleton-shimmer" />
                    </div>
                    <div className="h-5 w-12 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="h-3 w-32 rounded-full skeleton-shimmer" />
                    <div className="h-3 w-48 rounded-full skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}