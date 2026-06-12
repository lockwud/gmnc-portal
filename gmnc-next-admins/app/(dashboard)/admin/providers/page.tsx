import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProvidersPage from "@/components/admin/ProvidersPage";

export default function AdminProvidersRoute() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ProvidersPage />
    </ProtectedRoute>
  );
}
