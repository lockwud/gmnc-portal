import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProviderApprovalsPage from '@/components/admin/ProviderApprovalsPage';

export default function AdminProviderApprovalsRoute() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ProviderApprovalsPage />
    </ProtectedRoute>
  );
}