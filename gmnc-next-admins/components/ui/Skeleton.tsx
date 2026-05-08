import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-100", className)}
      {...props}
    />
  );
}

export { Skeleton };

export const SkeletonCard = () => (
  <div className="p-6 bg-white rounded-3xl border border-slate-100 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full space-y-4">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white">
      <div className="p-4 border-b border-slate-50">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-slate-50 last:border-0">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
