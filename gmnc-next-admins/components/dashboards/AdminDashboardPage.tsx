import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}