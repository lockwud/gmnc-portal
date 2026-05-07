import { TesterDashboard } from "@/components/dashboards/TesterDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function TesterDashboardPage() {
  return (
    <ProtectedRoute requiredRole="tester">
      <TesterDashboard />
    </ProtectedRoute>
  );
}