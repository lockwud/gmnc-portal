import { ProviderDashboard } from "@/components/dashboards/ProviderDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProviderDashboardPage() {
  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <ProviderDashboard />
    </ProtectedRoute>
  );
}
