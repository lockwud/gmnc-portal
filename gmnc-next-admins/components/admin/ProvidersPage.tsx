import { Suspense } from "react";
import { ProvidersPageContent } from "@/components/providers/ProvidersPageContent";
import  ProtectedRoute  from "@/components/auth/ProtectedRoute";

function ProvidersSkeleton() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-1">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-5 w-72 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="h-96 w-full animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<ProvidersSkeleton />}>
        <ProvidersPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}