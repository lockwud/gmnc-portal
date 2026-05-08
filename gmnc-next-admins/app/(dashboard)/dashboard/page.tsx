import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import OverviewPage from "@/components/dashboards/OverviewPage";

export default function DashboardRoute() {
  return (
    <ProtectedRoute>
      <OverviewPage />
    </ProtectedRoute>
  );
}
