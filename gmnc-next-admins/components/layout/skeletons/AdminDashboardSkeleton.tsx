'use client';

export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-64 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-10 w-40 rounded-full skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-40 rounded-xl skeleton-shimmer" />
            ))}
          </div>

          <div className="h-64 rounded-xl border border-slate-200 skeleton-shimmer" />
        </div>

        <div className="lg:col-span-4 h-full">
          <div className="h-80 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}