'use client';

export default function ProvidersSkeleton() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-1">
        <div className="h-8 w-64 rounded-xl skeleton-shimmer" />
        <div className="mt-1 h-4 w-96 rounded-full skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-[1.5rem] skeleton-shimmer" />
        ))}
      </div>

      <div className="grid h-full gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6 border-b border-slate-50 px-8 pb-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="relative max-w-md flex-1">
                <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl skeleton-shimmer" />
                <div className="h-12 w-40 rounded-2xl skeleton-shimmer" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-11 w-48 rounded-2xl skeleton-shimmer" />
              <div className="h-11 w-48 rounded-2xl skeleton-shimmer" />
              <div className="h-11 w-48 rounded-2xl skeleton-shimmer" />
            </div>
          </div>

          <div className="space-y-4 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl skeleton-shimmer" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-64 rounded-full skeleton-shimmer" />
                </div>
                <div className="h-8 w-8 rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-full lg:col-span-1">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8">
            <div className="h-6 w-40 rounded-full skeleton-shimmer mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl skeleton-shimmer" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-48 rounded-full skeleton-shimmer" />
                    <div className="h-3 w-32 rounded-full skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}