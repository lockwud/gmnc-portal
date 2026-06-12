import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TesterRoute() {
  return (
    <ProtectedRoute>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Tester dashboard is temporarily disabled to keep the build working.
      </div>
    </ProtectedRoute>
  );
}