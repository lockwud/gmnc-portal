import { Suspense } from "react";
import { ProvidersPageContent } from "@/components/providers/ProvidersPageContent";

function ProvidersSkeleton() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-1">
        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-5 w-72 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>
      <div className="h-96 w-full bg-slate-100 rounded-lg animate-pulse"></div>
    </div>
  );
}

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProvidersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<ProvidersSkeleton />}>
        <ProvidersPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
