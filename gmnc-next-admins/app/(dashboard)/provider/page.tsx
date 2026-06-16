import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProviderDashboard } from '@/components/dashboards/ProviderDashboard';

export default function ProviderPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <ProviderDashboard />
    </ProtectedRoute>
  );
}