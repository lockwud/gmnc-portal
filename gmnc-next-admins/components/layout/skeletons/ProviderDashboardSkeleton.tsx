'use client';

export default function ProviderDashboardSkeleton() {
  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-64 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-10 w-40 rounded-full skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[118px] rounded-xl skeleton-shimmer" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="h-[280px] rounded-xl skeleton-shimmer" />
        <div className="h-[280px] rounded-xl skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-[290px] rounded-xl skeleton-shimmer" />
        <div className="h-[290px] rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}
