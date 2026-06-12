import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SupportDashboardPage from "@/components/dashboards/SupportDashboardPage";

export default function SupportRoute() {
  return (
    <ProtectedRoute requiredRole="support">
      <SupportDashboardPage />
    </ProtectedRoute>
  );
}
