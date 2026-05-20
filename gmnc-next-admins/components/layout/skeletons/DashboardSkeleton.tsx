'use client';

export default function DashboardSkeleton() {
  return (
    <div className="px-6 pt-4 pb-6">
      <div className="w-full max-w-6xl">
        <div className="mb-1 h-8 w-48 rounded-xl skeleton-shimmer" />
        <div className="mb-5 h-4 w-64 rounded-full skeleton-shimmer" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl border bg-white p-5 transition-all"
              style={{ borderColor: '#e6e9f2' }}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded-full skeleton-shimmer" />
                  <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-40 rounded-full skeleton-shimmer" />
                </div>
              </div>
              <div className="mt-4 h-4 w-24 rounded-full skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}